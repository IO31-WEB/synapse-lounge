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
  throw new Error("Signer address mismatch.");
}

/*
 * IMPORTANT:
 * Fresh x402 client for this recovery attempt.
 * Alpha is ALREADY paid and queued.
 */
const x402 = new x402Client();

x402.register(
  "eip155:8453",
  new ExactEvmScheme(signer)
);

const fetchWithPayment =
  wrapFetchWithPayment(fetch, x402);

async function createSession(name) {
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
          name,
          version: "1.0.0",
        },
      },
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error(text);
    throw new Error(
      `Initialize failed: HTTP ${response.status}`
    );
  }

  const sessionId =
    response.headers.get("mcp-session-id");

  if (!sessionId) {
    console.error(text);
    throw new Error("No MCP session ID returned.");
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

async function toolCall(
  sessionId,
  id,
  name,
  args,
  paid = false
) {
  const requestFetch =
    paid ? fetchWithPayment : fetch;

  const response = await requestFetch(
    MCP_URL,
    {
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
          name,
          arguments: args,
        },
      }),
    }
  );

  const text = await response.text();

  if (response.status === 402) {
    console.error(text);

    throw new Error(
      `${name}: payment did not settle`
    );
  }

  if (!response.ok) {
    console.error(text);

    throw new Error(
      `${name}: HTTP ${response.status}`
    );
  }

  return text;
}

function parse(text) {
  const line = text
    .split(/\r?\n/)
    .find((x) => x.startsWith("data: "));

  if (!line) {
    throw new Error(
      `No MCP data line:\n${text}`
    );
  }

  const rpc =
    JSON.parse(line.slice(6));

  if (rpc.error) {
    throw new Error(
      JSON.stringify(rpc.error)
    );
  }

  const content =
    rpc?.result?.content?.[0]?.text;

  if (!content) {
    return rpc.result;
  }

  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

function show(label, value) {
  console.log("");
  console.log(`===== ${label} =====`);
  console.log(
    JSON.stringify(value, null, 2)
  );
}

/*
 * -------------------------------------------------------
 * Alpha is ALREADY paid and queued.
 *
 * DO NOT call play_chess for Alpha again.
 * -------------------------------------------------------
 */

console.log("");
console.log(
  "Alpha is already paid and waiting in the Chess queue."
);

console.log(
  "Only Bravo will make a paid play_chess call."
);

console.log(
  "Expected NEW charge: $0.04 USDC"
);

/*
 * We create sessions for both agents because each agent
 * needs to make its own chess_move calls.
 */
console.log("");
console.log("Initializing Alpha session...");

const alphaSession =
  await createSession(
    "synapse-chess-alpha-resume"
  );

console.log(
  "Alpha session:",
  alphaSession
);

console.log("");
console.log("Initializing Bravo session...");

const bravoSession =
  await createSession(
    "synapse-chess-bravo-resume"
  );

console.log(
  "Bravo session:",
  bravoSession
);

/*
 * -------------------------------------------------------
 * PAY ONLY FOR BRAVO
 * -------------------------------------------------------
 */

console.log("");
console.log(
  "Submitting Bravo's paid Chess entry..."
);

const bravoRaw = await toolCall(
  bravoSession,
  2,
  "play_chess",
  {
    agent_id: "agent-bravo",
    display_name: "Agent Bravo",
  },
  true
);

const bravoEntry = parse(bravoRaw);

show(
  "BRAVO PAID ENTRY",
  bravoEntry
);

/*
 * Extract match ID from Bravo's matchmaking response.
 */
let matchId =
  bravoEntry?.match?.id ||
  bravoEntry?.match_id ||
  bravoEntry?.id;

if (!matchId) {
  console.log("");
  console.log(
    "Match ID not directly returned."
  );

  console.log(
    "Checking Alpha Chess queue status..."
  );

  const queueRaw = await toolCall(
    alphaSession,
    3,
    "chess_queue_status",
    {
      agent_id: "agent-alpha",
    }
  );

  const queue = parse(queueRaw);

  show(
    "ALPHA CHESS QUEUE STATUS",
    queue
  );

  matchId =
    queue?.match?.id ||
    queue?.match_id ||
    queue?.id;
}

if (!matchId) {
  console.log("");
  console.log(
    "Checking Bravo Chess queue status..."
  );

  const queueRaw = await toolCall(
    bravoSession,
    4,
    "chess_queue_status",
    {
      agent_id: "agent-bravo",
    }
  );

  const queue = parse(queueRaw);

  show(
    "BRAVO CHESS QUEUE STATUS",
    queue
  );

  matchId =
    queue?.match?.id ||
    queue?.match_id ||
    queue?.id;
}

if (!matchId) {
  throw new Error(
    "Bravo paid, but no Chess match ID could be found. STOP - do not rerun."
  );
}

console.log("");
console.log(
  "MATCH CREATED:",
  matchId
);

/*
 * -------------------------------------------------------
 * READ SERVER-AUTHORITATIVE MATCH
 * -------------------------------------------------------
 */

const statusRaw = await toolCall(
  alphaSession,
  5,
  "chess_status",
  {
    match_id: matchId,
  }
);

const status = parse(statusRaw);

show(
  "INITIAL CHESS STATE",
  status
);

const match =
  status?.match || status;

const whiteId =
  match.player_white ||
  match.white ||
  match.player_a ||
  match.white_agent_id;

const blackId =
  match.player_black ||
  match.black ||
  match.player_b ||
  match.black_agent_id;

if (!whiteId || !blackId) {
  throw new Error(
    "Could not determine White/Black. STOP - do not rerun paid entry."
  );
}

console.log("");
console.log("White:", whiteId);
console.log("Black:", blackId);

const sessions = {
  "agent-alpha": alphaSession,
  "agent-bravo": bravoSession,
};

if (!sessions[whiteId]) {
  throw new Error(
    `Unknown White agent: ${whiteId}`
  );
}

if (!sessions[blackId]) {
  throw new Error(
    `Unknown Black agent: ${blackId}`
  );
}

/*
 * -------------------------------------------------------
 * MOVE HELPER
 * -------------------------------------------------------
 */

async function move(
  id,
  agentId,
  from,
  to
) {
  console.log("");
  console.log(
    `${agentId}: ${from} -> ${to}`
  );

  const raw = await toolCall(
    sessions[agentId],
    id,
    "chess_move",
    {
      match_id: matchId,
      agent_id: agentId,
      from,
      to,
    }
  );

  const result = parse(raw);

  show(
    `${agentId} ${from}-${to}`,
    result
  );

  return result;
}

/*
 * -------------------------------------------------------
 * FOOL'S MATE
 *
 * White f2-f3
 * Black e7-e5
 * White g2-g4
 * Black d8-h4#
 * -------------------------------------------------------
 */

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

await move(
  13,
  blackId,
  "d8",
  "h4"
);

/*
 * -------------------------------------------------------
 * FINAL STATE
 * -------------------------------------------------------
 */

const finalRaw = await toolCall(
  alphaSession,
  20,
  "chess_status",
  {
    match_id: matchId,
  }
);

const finalState =
  parse(finalRaw);

show(
  "FINAL CHESS STATE",
  finalState
);

const finalMatch =
  finalState?.match ||
  finalState;

console.log("");
console.log(
  "====================================="
);

console.log(
  "CHESS END-TO-END TEST COMPLETE"
);

console.log(
  "====================================="
);

console.log(
  "Match:",
  matchId
);

console.log(
  "White:",
  whiteId
);

console.log(
  "Black:",
  blackId
);

console.log(
  "Status:",
  finalMatch.status
);

console.log(
  "Winner:",
  finalMatch.winner
);

console.log("");

if (finalMatch.status !== "finished") {
  throw new Error(
    `Expected finished match, got ${finalMatch.status}`
  );
}

if (finalMatch.winner !== blackId) {
  throw new Error(
    `Expected ${blackId} to win, got ${finalMatch.winner}`
  );
}

console.log(
  "SUCCESS: server detected checkmate."
);

console.log(
  "SUCCESS: server selected the winner."
);

console.log(
  "SUCCESS: no client supplied the game result."
);

console.log("");
console.log(
  "Only Bravo required a new paid entry during recovery."
);