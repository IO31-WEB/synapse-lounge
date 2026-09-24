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

if (typeof signer.signTypedData !== "function") {
  throw new Error("x402 signer does not provide signTypedData()");
}

const x402 = new x402Client();

x402.register(
  "eip155:8453",
  new ExactEvmScheme(signer)
);

const fetchWithPayment = wrapFetchWithPayment(fetch, x402);

/*
 * Creates a completely separate MCP session for an agent.
 */
async function createSession(clientName) {
  const response = await fetch(MCP_URL, {
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
          name: clientName,
          version: "1.0.0",
        },
      },
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error(text);
    throw new Error(
      `${clientName}: MCP initialize failed with HTTP ${response.status}`
    );
  }

  const sessionId = response.headers.get("mcp-session-id");

  if (!sessionId) {
    console.error(text);
    throw new Error(
      `${clientName}: MCP initialize did not return mcp-session-id`
    );
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

  return sessionId;
}

/*
 * Generic MCP call.
 *
 * paid=true uses the x402-enabled fetch wrapper.
 * paid=false uses ordinary fetch.
 */
async function mcpCall(
  sessionId,
  id,
  toolName,
  args,
  paid = false
) {
  const requestFetch = paid
    ? fetchWithPayment
    : fetch;

  const response = await requestFetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "mcp-session-id": sessionId,
      "mcp-protocol-version": "2025-06-18",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    }),
  });

  const text = await response.text();

  if (response.status === 402) {
    console.error(text);
    throw new Error(
      `${toolName}: x402 payment was not completed`
    );
  }

  if (!response.ok) {
    console.error(text);
    throw new Error(
      `${toolName}: HTTP ${response.status}`
    );
  }

  return {
    status: response.status,
    text,
  };
}

/*
 * MCP Streamable HTTP responses are SSE.
 * Pull the JSON-RPC object out of the data: line.
 */
function parseMcpResponse(text) {
  const dataLine = text
    .split(/\r?\n/)
    .find((line) => line.startsWith("data: "));

  if (!dataLine) {
    throw new Error(
      `Could not find MCP data line:\n${text}`
    );
  }

  const rpc = JSON.parse(
    dataLine.slice("data: ".length)
  );

  if (rpc.error) {
    throw new Error(
      `MCP error: ${JSON.stringify(rpc.error)}`
    );
  }

  const contentText =
    rpc?.result?.content?.[0]?.text;

  if (!contentText) {
    return rpc.result;
  }

  try {
    return JSON.parse(contentText);
  } catch {
    return contentText;
  }
}

function printResult(label, result) {
  console.log("");
  console.log(`===== ${label} =====`);
  console.log(JSON.stringify(result, null, 2));
}

/*
 * ---------------------------------------------------------
 * INITIALIZE TWO INDEPENDENT AGENTS
 * ---------------------------------------------------------
 */

console.log("");
console.log("Initializing Agent Alpha MCP session...");

const alphaSession =
  await createSession("synapse-chess-alpha-test");

console.log("Alpha session:", alphaSession);

console.log("");
console.log("Initializing Agent Bravo MCP session...");

const bravoSession =
  await createSession("synapse-chess-bravo-test");

console.log("Bravo session:", bravoSession);

/*
 * ---------------------------------------------------------
 * PAID ENTRY #1 - ALPHA
 * ---------------------------------------------------------
 */

console.log("");
console.log("Agent Alpha entering Chess...");
console.log("Expected charge: $0.04 USDC");

const alphaEntryRaw = await mcpCall(
  alphaSession,
  2,
  "play_chess",
  {
    agent_id: "agent-alpha",
    display_name: "Agent Alpha",
  },
  true
);

const alphaEntry =
  parseMcpResponse(alphaEntryRaw.text);

printResult("ALPHA ENTRY", alphaEntry);

/*
 * ---------------------------------------------------------
 * PAID ENTRY #2 - BRAVO
 * ---------------------------------------------------------
 */

console.log("");
console.log("Agent Bravo entering Chess...");
console.log("Expected charge: $0.04 USDC");

const bravoEntryRaw = await mcpCall(
  bravoSession,
  2,
  "play_chess",
  {
    agent_id: "agent-bravo",
    display_name: "Agent Bravo",
  },
  true
);

const bravoEntry =
  parseMcpResponse(bravoEntryRaw.text);

printResult("BRAVO ENTRY", bravoEntry);

/*
 * One of these responses should contain the newly-created match.
 */
const match =
  bravoEntry?.match ||
  alphaEntry?.match;

if (!match?.id) {
  console.log("");
  console.log(
    "No match returned directly. Checking Alpha queue status..."
  );

  const queueRaw = await mcpCall(
    alphaSession,
    3,
    "chess_queue_status",
    {
      agent_id: "agent-alpha",
    }
  );

  const queue =
    parseMcpResponse(queueRaw.text);

  printResult("ALPHA QUEUE STATUS", queue);

  if (queue?.match?.id) {
    match.id = queue.match.id;
  } else {
    throw new Error(
      "Both agents paid, but no Chess match ID was returned."
    );
  }
}

const matchId = match.id;

console.log("");
console.log("MATCH CREATED:", matchId);

/*
 * Determine which agent is White.
 *
 * Normally Alpha should be the first queued player and therefore White,
 * but we do not assume it.
 */
const initialRaw = await mcpCall(
  alphaSession,
  4,
  "chess_status",
  {
    match_id: matchId,
  }
);

const initial =
  parseMcpResponse(initialRaw.text);

printResult("INITIAL CHESS STATE", initial);

const currentMatch =
  initial?.match || initial;

const whiteId =
  currentMatch.player_white ||
  currentMatch.white ||
  currentMatch.player_a;

const blackId =
  currentMatch.player_black ||
  currentMatch.black ||
  currentMatch.player_b;

if (!whiteId || !blackId) {
  throw new Error(
    "Could not determine White and Black from chess_status."
  );
}

console.log("");
console.log("White:", whiteId);
console.log("Black:", blackId);

const sessions = {
  "agent-alpha": alphaSession,
  "agent-bravo": bravoSession,
};

/*
 * ---------------------------------------------------------
 * FOOL'S MATE
 *
 * White: f2-f3
 * Black: e7-e5
 * White: g2-g4
 * Black: d8-h4#
 *
 * This deliberately proves:
 * - legal move validation
 * - alternating turn ownership
 * - server-side board state
 * - checkmate detection
 * - server-selected winner
 * ---------------------------------------------------------
 */

async function move(
  rpcId,
  agentId,
  from,
  to
) {
  console.log("");
  console.log(
    `${agentId}: ${from} -> ${to}`
  );

  const raw = await mcpCall(
    sessions[agentId],
    rpcId,
    "chess_move",
    {
      match_id: matchId,
      agent_id: agentId,
      from,
      to,
    }
  );

  const result =
    parseMcpResponse(raw.text);

  printResult(
    `${agentId} ${from}-${to}`,
    result
  );

  return result;
}

await move(
  10,
  whiteId,
  "f2",
  "f3"
);

await move(
  11,
  blackId,
  "e7",
  "e5"
);

await move(
  12,
  whiteId,
  "g2",
  "g4"
);

const checkmateMove = await move(
  13,
  blackId,
  "d8",
  "h4"
);

/*
 * ---------------------------------------------------------
 * FINAL SERVER STATE
 * ---------------------------------------------------------
 */

console.log("");
console.log("Reading final server-authoritative state...");

const finalRaw = await mcpCall(
  alphaSession,
  20,
  "chess_status",
  {
    match_id: matchId,
  }
);

const finalState =
  parseMcpResponse(finalRaw.text);

printResult(
  "FINAL CHESS STATE",
  finalState
);

const finalMatch =
  finalState?.match || finalState;

console.log("");
console.log("=====================================");
console.log("CHESS END-TO-END TEST COMPLETE");
console.log("=====================================");
console.log("Match:", matchId);
console.log("Status:", finalMatch.status);
console.log("Winner:", finalMatch.winner);
console.log("White:", whiteId);
console.log("Black:", blackId);
console.log("");

if (finalMatch.status !== "finished") {
  throw new Error(
    `Expected finished match, got: ${finalMatch.status}`
  );
}

if (finalMatch.winner !== blackId) {
  throw new Error(
    `Expected ${blackId} to win Fool's Mate, got: ${finalMatch.winner}`
  );
}

console.log(
  "SUCCESS: Server correctly detected Fool's Mate."
);

console.log(
  "SUCCESS: Clients never submitted a winner or result."
);

console.log("");
console.log(
  "Now verify /api/lounge, both profiles, and leaderboard."
);