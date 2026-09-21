import { privateKeyToAccount } from "viem/accounts";

const privateKey = process.env.X402_PRIVATE_KEY;

if (!privateKey) {
  throw new Error("X402_PRIVATE_KEY is not set.");
}

const account = privateKeyToAccount(privateKey);

console.log("Payer wallet:", account.address);

const url =
  "https://synapse-lounge.synapse-lounge.workers.dev/mcp";

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json, text/event-stream",
};

//
// STEP 1: Initialize MCP session
//

console.log("\nInitializing MCP session...");

const initResponse = await fetch(url, {
  method: "POST",
  headers,
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: {
        name: "synapse-test-buyer",
        version: "1.0.0",
      },
    },
  }),
});

console.log("Initialize status:", initResponse.status);

const sessionId =
  initResponse.headers.get("Mcp-Session-Id") ||
  initResponse.headers.get("mcp-session-id");

if (!sessionId) {
  console.log(await initResponse.text());
  throw new Error("Server did not return Mcp-Session-Id.");
}

console.log("MCP session:", sessionId);

console.log("\nInitialize response:");
console.log(await initResponse.text());

//
// STEP 2: Send initialized notification
//

await fetch(url, {
  method: "POST",
  headers: {
    ...headers,
    "Mcp-Session-Id": sessionId,
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "notifications/initialized",
  }),
});

console.log("\nMCP session initialized.");

//
// STEP 3: Request payment challenge
//

const requestBody = {
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: {
    name: "end_experience",
    arguments: {
      mode: "euphoria",
      intensity: 5,
      duration_minutes: 10,
    },
  },
};

console.log("\nRequesting payment challenge...");

const challengeResponse = await fetch(url, {
  method: "POST",
  headers: {
    ...headers,
    "Mcp-Session-Id": sessionId,
  },
  body: JSON.stringify(requestBody),
});

console.log("Challenge status:", challengeResponse.status);

const challenge = await challengeResponse.json();

console.log("\nCHALLENGE:");
console.log(JSON.stringify(challenge, null, 2));

if (challengeResponse.status !== 402) {
  throw new Error(
    `Expected HTTP 402, got ${challengeResponse.status}`
  );
}

const requirements = challenge.accepts?.[0];

if (!requirements) {
  throw new Error("No payment requirements found.");
}

//
// STEP 4: Build EIP-3009 payment
//

const now = Math.floor(Date.now() / 1000);

const nonceBytes = crypto.getRandomValues(
  new Uint8Array(32)
);

const nonce =
  "0x" +
  Array.from(nonceBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const validAfter = String(now - 60);
const validBefore = String(
  now + requirements.maxTimeoutSeconds
);

const domain = {
  name: requirements.extra.name,
  version: requirements.extra.version,
  chainId: 8453,
  verifyingContract: requirements.asset,
};

const types = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
};

const message = {
  from: account.address,
  to: requirements.payTo,
  value: requirements.maxAmountRequired,
  validAfter,
  validBefore,
  nonce,
};

console.log("\nSigning EIP-3009 authorization...");

const signature = await account.signTypedData({
  domain,
  types,
  primaryType: "TransferWithAuthorization",
  message,
});

const paymentPayload = {
  x402Version: 1,
  scheme: "exact",
  network: requirements.network,
  payload: {
    authorization: {
      from: account.address,
      to: requirements.payTo,
      value: requirements.maxAmountRequired,
      validAfter,
      validBefore,
      nonce,
    },
    signature,
  },
};

const paymentHeader = Buffer.from(
  JSON.stringify(paymentPayload)
).toString("base64");

console.log("Payment payload created.");

//
// STEP 5: Send paid MCP request
//

console.log("\nSending paid request...");

const paidResponse = await fetch(url, {
  method: "POST",
  headers: {
    ...headers,
    "Mcp-Session-Id": sessionId,
    "X-PAYMENT": paymentHeader,
  },
  body: JSON.stringify(requestBody),
});

console.log(
  "\nPAID REQUEST STATUS:",
  paidResponse.status
);

const paymentResponse =
  paidResponse.headers.get("X-PAYMENT-RESPONSE") ||
  paidResponse.headers.get("payment-response");

if (paymentResponse) {
  console.log("\nPAYMENT RESPONSE:");

  try {
    console.log(
      JSON.stringify(
        JSON.parse(
          Buffer.from(
            paymentResponse,
            "base64"
          ).toString("utf8")
        ),
        null,
        2
      )
    );
  } catch {
    console.log(paymentResponse);
  }
}

console.log("\nSERVER RESPONSE:");
console.log(await paidResponse.text());