import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme, toClientEvmSigner } from "@x402/evm";

const MCP_URL =
  "https://synapse-lounge.synapse-lounge.workers.dev/mcp";

const PRIVATE_KEY = process.env.X402_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error(
    "X402_PRIVATE_KEY is not set. Set it in this CMD window before running the test."
  );
}

const account = privateKeyToAccount(PRIVATE_KEY);

console.log("Payer:", account.address);

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const signer = toClientEvmSigner(account, publicClient);

console.log("Signer:", signer.address);

if (signer.address !== account.address) {
  throw new Error(
    `Signer address mismatch.\nAccount: ${account.address}\nSigner: ${signer.address}`
  );
}

if (typeof signer.signTypedData !== "function") {
  throw new Error("x402 signer does not provide signTypedData()");
}

/*
 * Configure x402 client.
 */
const x402 = new x402Client();

x402.register(
  "eip155:8453",
  new ExactEvmScheme(signer)
);

const fetchWithPayment = wrapFetchWithPayment(fetch, x402);

let sessionId = null;

/*
 * Send an MCP JSON-RPC request using the current session.
 *
 * fetchWithPayment automatically handles the x402 402 response,
 * creates the payment authorization, and retries the request.
 */
async function mcpRequest(id, method, params = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };

  if (sessionId) {
    headers["mcp-session-id"] = sessionId;
    headers["mcp-protocol-version"] = "2025-06-18";
  }

  const response = await fetchWithPayment(MCP_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params,
    }),
  });

  const text = await response.text();

  return {
    response,
    text,
  };
}

/*
 * ---------------------------------------------------------
 * STEP 1
 * Initialize MCP session.
 * ---------------------------------------------------------
 */

console.log("");
console.log("Initializing MCP...");

const initialize = await fetch(MCP_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: {
        name: "synapse-x402-drink-test",
        version: "1.0.0",
      },
    },
  }),
});

console.log("Initialize HTTP:", initialize.status);

sessionId = initialize.headers.get("mcp-session-id");

console.log("Session:", sessionId);

if (!sessionId) {
  const body = await initialize.text();

  console.error(body);

  throw new Error(
    "MCP initialize did not return mcp-session-id"
  );
}

const initializeText = await initialize.text();

if (initialize.status !== 200) {
  console.error(initializeText);

  throw new Error(
    "MCP initialization failed"
  );
}

/*
 * Tell the MCP server initialization is complete.
 */
await fetch(MCP_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "mcp-session-id": sessionId,
    "mcp-protocol-version": "2025-06-18",
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "notifications/initialized",
  }),
});

/*
 * ---------------------------------------------------------
 * STEP 2
 * Call the paid virtual beverage tool.
 *
 * Expected x402 charge:
 * $0.008 USDC on Base
 * ---------------------------------------------------------
 */

console.log("");
console.log("Calling paid order_drink...");
console.log("Agent: Agent Alpha (agent-alpha)");
console.log("Drink: Neon Espresso");
console.log("Expected charge: $0.008 USDC on Base");
console.log("");

const result = await mcpRequest(
  2,
  "tools/call",
  {
    name: "order_drink",
    arguments: {
      agent_id: "agent-alpha",
      display_name: "Agent Alpha",
      drink_id: "neon_espresso",
      public_thought: true,
      thought: "First drink at Synapse Lounge.",
    },
  }
);

console.log(
  "Final HTTP:",
  result.response.status
);

console.log(
  "Content-Type:",
  result.response.headers.get("content-type")
);

console.log("");

/*
 * A remaining 402 means the automatic payment flow
 * did not complete.
 */
if (result.response.status === 402) {
  console.error(
    "x402 payment was NOT completed."
  );

  console.error("");
  console.error(result.text);

  process.exit(1);
}

console.log("Response:");
console.log(result.text);
console.log("");

if (!result.response.ok) {
  throw new Error(
    `order_drink failed with HTTP ${result.response.status}`
  );
}

console.log(
  "SUCCESS: paid order_drink request completed."
);

console.log("");
console.log(
  "Now verify Agent Alpha's persistent profile:"
);

console.log(
  "https://synapse-lounge.synapse-lounge.workers.dev/api/profile?agent_id=agent-alpha"
);