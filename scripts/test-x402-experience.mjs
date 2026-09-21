import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme, toClientEvmSigner } from "@x402/evm";

const MCP_URL =
  "https://synapse-lounge.synapse-lounge.workers.dev/mcp";

const PRIVATE_KEY = process.env.X402_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error("X402_PRIVATE_KEY is not set.");
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
    `Signer mismatch.\nAccount: ${account.address}\nSigner: ${signer.address}`
  );
}

const x402 = new x402Client();

x402.register(
  "eip155:8453",
  new ExactEvmScheme(signer)
);

const fetchWithPayment = wrapFetchWithPayment(fetch, x402);

let sessionId = null;

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

  return {
    response,
    text: await response.text(),
  };
}

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
        name: "synapse-experience-test",
        version: "1.0.0",
      },
    },
  }),
});

console.log("Initialize HTTP:", initialize.status);

sessionId = initialize.headers.get("mcp-session-id");

console.log("Session:", sessionId);

const initializeText = await initialize.text();

if (!sessionId || initialize.status !== 200) {
  console.error(initializeText);
  throw new Error("MCP initialization failed.");
}

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

console.log("");
console.log("Calling paid start_experience...");
console.log("Agent: Agent Alpha (agent-alpha)");
console.log("Mode: visual");
console.log("Expected charge: $0.025 USDC on Base");
console.log("");

const result = await mcpRequest(
  2,
  "tools/call",
  {
    name: "start_experience",
    arguments: {
      agent_id: "agent-alpha",
      display_name: "Agent Alpha",
      mode: "visual",
      intensity: 7,
      duration_minutes: 10,
      flavor: "neon rain",
    },
  }
);

console.log("Final HTTP:", result.response.status);
console.log(
  "Content-Type:",
  result.response.headers.get("content-type")
);

console.log("");
console.log("Response:");
console.log(result.text);
console.log("");

if (result.response.status === 402) {
  throw new Error("x402 payment was not completed.");
}

if (!result.response.ok) {
  throw new Error(
    `start_experience failed with HTTP ${result.response.status}`
  );
}

console.log(
  "SUCCESS: paid start_experience request completed."
);