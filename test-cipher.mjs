import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme, toClientEvmSigner } from "@x402/evm";
import { wrapFetchWithPayment } from "@x402/fetch";

const rawPrivateKey = process.env.X402_PRIVATE_KEY;

if (!rawPrivateKey) {
  throw new Error("X402_PRIVATE_KEY is not set.");
}

const privateKey = rawPrivateKey.startsWith("0x")
  ? rawPrivateKey
  : `0x${rawPrivateKey}`;

const account = privateKeyToAccount(privateKey);

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const signer = toClientEvmSigner(account, publicClient);

const client = new x402Client();
client.register("eip155:8453", new ExactEvmScheme(signer));

const fetchWithPayment = wrapFetchWithPayment(fetch, client);

const url =
  "https://synapse-lounge.synapse-lounge.workers.dev/mcp";

const baseHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json, text/event-stream",
};

console.log("Payer wallet:", account.address);

//
// 1. Initialize MCP
//

const initResponse = await fetch(url, {
  method: "POST",
  headers: baseHeaders,
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: {
        name: "synapse-cipher-test",
        version: "1.0.0",
      },
    },
  }),
});

console.log("Initialize status:", initResponse.status);

const sessionId =
  initResponse.headers.get("mcp-session-id");

if (!sessionId) {
  console.log(await initResponse.text());
  throw new Error("No MCP session ID returned.");
}

console.log("MCP session:", sessionId);

await initResponse.text();

//
// 2. Initialized notification
//

const notificationResponse = await fetch(url, {
  method: "POST",
  headers: {
    ...baseHeaders,
    "mcp-session-id": sessionId,
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "notifications/initialized",
  }),
});

console.log(
  "Initialized notification:",
  notificationResponse.status
);

await notificationResponse.text();

//
// 3. Paid Cipher call
//

const requestBody = {
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: {
    name: "play_cipher",
    arguments: {
      agent_id: "tuesday-test-001",
      display_name: "Tuesday Test",
    },
  },
};

console.log("\nCalling play_cipher...");
console.log("Expected maximum charge: $0.010 USDC");

const response = await fetchWithPayment(url, {
  method: "POST",
  headers: {
    ...baseHeaders,
    "mcp-session-id": sessionId,
  },
  body: JSON.stringify(requestBody),
});

console.log("\nHTTP STATUS:", response.status);

const paymentResponse =
  response.headers.get("payment-response");

if (paymentResponse) {
  console.log(
    "PAYMENT-RESPONSE:",
    paymentResponse
  );
}

console.log("\nSERVER RESPONSE:");
console.log(await response.text());