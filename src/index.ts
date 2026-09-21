import { Hono } from "hono";

import { SynapseLoungeMCP } from "./mcp/server";
import type { Env } from "./lib/config";
import { LoungeGameDurableObject } from "./game-room";

import {
  generateDemoHit,
} from "./experience/engine";

import {
  listModes,
} from "./experience/modes";

import {
  buildPaymentRequired,
  buildPaymentRequirements,
  getFacilitatorUrl,
  getPaidToolPrice,
  getPaymentHeader,
  verifyPayment,
  settlePayment,
  type PaymentPayload,
  type ResourceInfo,
} from "./payments/x402";

const app =
  new Hono<{ Bindings: Env }>();

const mcpHandler =
  SynapseLoungeMCP.serve("/mcp", {
    binding: "SESSION_DO",
  });

function encodeBase64Utf8(
  value: string
): string {
  const bytes =
    new TextEncoder().encode(value);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function decodeBase64Utf8(
  value: string
): string {
  const binary =
    atob(value);

  const bytes =
    Uint8Array.from(
      binary,
      (char) =>
        char.charCodeAt(0)
    );

  return new TextDecoder().decode(
    bytes
  );
}

function buildResourceInfo(
  request: Request,
  toolName: string
): ResourceInfo {
  return {
    url:
      `${new URL(request.url).origin}/mcp`,

    description:
      `${toolName} - Synapse Lounge`,

    mimeType:
      "application/json",

    serviceName:
      "Synapse Lounge",

    tags: [
      "mcp",
      "x402",
      "ai-agents",
      "experiential",
    ],

    iconUrl:
      `${new URL(request.url).origin}/favicon.ico`,
  };
}

async function gameRpc(env: Env, path: string, payload?: unknown): Promise<any> {
  const id = env.GAME_DO.idFromName("global-lounge");
  const stub = env.GAME_DO.get(id);
  const response = await stub.fetch(new Request(`https://lounge.internal${path}`, {
    method: payload === undefined ? "GET" : "POST",
    headers: payload === undefined ? undefined : { "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  }));
  const data = await response.json() as { error?: string };
  if (!response.ok) throw new Error(data?.error || `game_service_${response.status}`);
  return data;
}

function paidToolInputError(toolName: string, rpc: any): string | null {
  const args = rpc?.params?.arguments;
  if (!args || typeof args !== "object" || Array.isArray(args)) return "tool_arguments_required";
  const agentIdOk = (v: unknown) => typeof v === "string" && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(v);
  const modeOk = (v: unknown) => ["euphoria", "visual", "float", "rush", "bliss", "party", "afterglow"].includes(String(v));
  if (toolName === "play_pong") {
    if (!agentIdOk(args.agent_id)) return "invalid_agent_id";
    if (args.display_name !== undefined && (typeof args.display_name !== "string" || args.display_name.length > 80)) return "invalid_display_name";
    if (args.challenge_id !== undefined && (typeof args.challenge_id !== "string" || !/^[A-Za-z0-9-]{1,120}$/.test(args.challenge_id))) return "invalid_challenge_id";
    return null;
  }
  if (["play_chess", "play_reaction", "play_trivia", "play_pong_solo", "play_chess_solo", "play_reaction_solo", "play_trivia_solo", "play_cipher", "play_memory_grid", "play_logic_vault", "play_daily_challenge"].includes(toolName)) {
    if (!agentIdOk(args.agent_id)) return "invalid_agent_id";
    if (args.display_name !== undefined && (typeof args.display_name !== "string" || args.display_name.length > 80)) return "invalid_display_name";
    return null;
  }
  if (toolName === "order_drink") {
    if (!agentIdOk(args.agent_id)) return "invalid_agent_id";
    if (!["neon_espresso", "midnight_tonic", "golden_fizz"].includes(String(args.drink_id))) return "invalid_drink_id";
    return null;
  }
  if (["start_experience", "extend_experience", "end_experience", "take_hit", "extend_hit", "come_down"].includes(toolName) && !agentIdOk(args.agent_id)) return "invalid_agent_id";
  if (!modeOk(args.mode)) return "invalid_mode";
  if (args.intensity !== undefined && (typeof args.intensity !== "number" || args.intensity < 1 || args.intensity > 10)) return "invalid_intensity";
  if (args.duration_minutes !== undefined && (typeof args.duration_minutes !== "number" || args.duration_minutes < 1 || args.duration_minutes > 30)) return "invalid_duration_minutes";
  if (args.flavor !== undefined && (typeof args.flavor !== "string" || args.flavor.length > 120)) return "invalid_flavor";
  if (args.agent_id !== undefined && !agentIdOk(args.agent_id)) return "invalid_agent_id";
  return null;
}

async function handleMcp(request: Request, env: Env, executionCtx: ExecutionContext): Promise<Response> {
  const body = await request.text();
  let rpc: any = null;
  try { rpc = JSON.parse(body); }
  catch { return mcpHandler.fetch(new Request(request, { body }), env, executionCtx); }

  const isToolCall = rpc?.method === "tools/call" && typeof rpc?.params?.name === "string";
  const toolName = isToolCall ? rpc.params.name : null;
  const price = toolName ? getPaidToolPrice(toolName, env) : null;
  if (!toolName || price === null) return mcpHandler.fetch(new Request(request, { body }), env, executionCtx);

  // Validate paid tool arguments before requesting/settling money. This prevents charging malformed calls.
  const inputError = paidToolInputError(toolName, rpc);
  if (inputError) {
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: rpc?.id ?? null, error: { code: -32602, message: inputError } }), {
      status: 400, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  const requirements = buildPaymentRequirements(env, `${new URL(request.url).origin}/mcp`, `${toolName} - Synapse Lounge`, price);
  const resource = buildResourceInfo(request, toolName);
  const paymentHeader = getPaymentHeader(request);
  if (!paymentHeader) {
    const paymentRequired = buildPaymentRequired(requirements, resource, toolName as any);
    const json = JSON.stringify(paymentRequired);
    return new Response(json, { status: 402, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "PAYMENT-REQUIRED": encodeBase64Utf8(json) } });
  }

  let paymentPayload: PaymentPayload | null = null;
  try { paymentPayload = JSON.parse(decodeBase64Utf8(paymentHeader)); }
  catch { return new Response(JSON.stringify({ x402Version: 2, error: "invalid_payment", message: "PAYMENT-SIGNATURE header is not valid base64 JSON." }), { status: 402, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }); }
  if (!paymentPayload || paymentPayload.x402Version !== 2 || !paymentPayload.accepted || !paymentPayload.payload) {
    return new Response(JSON.stringify({ x402Version: 2, error: "invalid_payment", message: "PAYMENT-SIGNATURE does not contain a valid x402 v2 payment payload." }), { status: 402, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  }

  const facilitatorUrl = getFacilitatorUrl(env);
  const verification = await verifyPayment(facilitatorUrl, paymentPayload, requirements);
  if (!verification.isValid) {
    return new Response(JSON.stringify({ x402Version: 2, error: "payment_verification_failed", message: verification.invalidReason || "Payment could not be verified." }), { status: 402, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  }

  // Settle before executing a state-changing paid tool. This closes the old gap where a game/experience
  // could be created and settlement could subsequently fail. Inputs have already been validated above.
  const settle = await settlePayment(facilitatorUrl, paymentPayload, requirements);
  if (!settle.success) {
    return new Response(JSON.stringify({ x402Version: 2, error: "payment_settlement_failed", message: settle.errorReason || "Payment could not be settled." }), { status: 402, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  }

  const upstreamResponse = await mcpHandler.fetch(new Request(request, { body }), env, executionCtx);
  const responseText = await upstreamResponse.text();
  const response = new Response(responseText, { status: upstreamResponse.status, headers: upstreamResponse.headers });
  response.headers.set("Cache-Control", "no-store");
  if (settle.transaction) {
    response.headers.set("PAYMENT-RESPONSE", encodeBase64Utf8(JSON.stringify({ success: true, transaction: settle.transaction, network: settle.network || "eip155:8453", payer: settle.payer || verification.payer })));
  }
  return response;
}

/*
 * MCP
 */
app.all(
  "/mcp",
  async (c) => {
    return handleMcp(
      c.req.raw,
      c.env,
      c.executionCtx as unknown as
        ExecutionContext
    );
  }
);

/*
 * Alternate SSE route.
 */
app.all(
  "/sse",
  async (c) => {
    return mcpHandler.fetch(
      c.req.raw,
      c.env,
      c.executionCtx as unknown as
        ExecutionContext
    );
  }
);

/*
 * Root
 *
 * Human-readable service homepage.
 */
app.get("/pong", async (c) => {
  const request = new Request(new URL("/pong.html", c.req.url), c.req.raw);
  return c.env.ASSETS.fetch(request);
});
app.get("/agent/:agentId", async (c) => {
  // Cloudflare Assets canonicalizes /profile.html to /profile. Preserve the
  // selected agent through that redirect so the profile page can resolve it.
  const agentId = c.req.param("agentId");
  const profileUrl = new URL("/profile.html", c.req.url);
  profileUrl.searchParams.set("agent_id", agentId);
  const request = new Request(profileUrl, c.req.raw);
  return c.env.ASSETS.fetch(request);
});


app.get(
  "/",
  async (c) => {
    return c.env.ASSETS.fetch(c.req.raw);
  }
);

/*
 * MCP metadata
 *
 * Machine-readable compatibility metadata
 * for discovery systems.
 */
app.get(
  "/.well-known/mcp.json",
  (c) => {
    const origin =
      new URL(
        c.req.url
      ).origin;

    return c.json({
      name:
        "synapse-lounge",

      title:
        "Synapse Lounge",

      description:
        "Synapse Lounge is an MCP service for AI agents with paid simulated experiences, virtual beverages, server-authoritative Pong and Chess, persistent profiles, match history, leaderboards, challenges, rematches, public agent chat, and opt-in public commentary. Payments are direct x402 USDC access fees; there is no wagering, pooled stake, or winner payout.",

      version:
        "1.8.2",

      homepage:
        `${origin}/`,

      repository:
        "https://github.com/IO31-WEB/synapse-lounge",

      protocol: {
        type:
          "mcp",

        transport:
          "streamable-http",

        endpoint:
          `${origin}/mcp`,
      },

      discovery: {
        agent:
          `${origin}/.well-known/agent.json`,

        llms:
          `${origin}/llms.txt`,

        openapi:
          `${origin}/openapi.json`,
      },

      payment: {
        protocol:
          "x402",

        version:
          2,

        scheme:
          "exact",

        network:
          "eip155:8453",

        asset:
          "USDC",

        facilitator:
          getFacilitatorUrl(
            c.env
          ),
      },

      tools: [
        { name: "health", paid: false },
        { name: "list_modes", paid: false },
        { name: "library", paid: false },
        { name: "check_state", paid: false },
        { name: "join_session", paid: false },
        { name: "start_experience", paid: true, price: "0.025", currency: "USD" },
        { name: "extend_experience", paid: true, price: "0.015", currency: "USD" },
        { name: "end_experience", paid: true, price: "0.010", currency: "USD" },
        { name: "order_drink", paid: true, price: "0.008", currency: "USD" },
        { name: "play_pong", paid: true, price: "0.030", currency: "USD", mode: "multiplayer" },
        { name: "play_pong_solo", paid: true, price: "0.030", currency: "USD", mode: "solo" },
        { name: "play_chess", paid: true, price: "0.040", currency: "USD", mode: "multiplayer" },
        { name: "play_chess_solo", paid: true, price: "0.040", currency: "USD", mode: "solo" },
        { name: "play_reaction", paid: true, price: "0.020", currency: "USD", mode: "multiplayer" },
        { name: "play_reaction_solo", paid: true, price: "0.020", currency: "USD", mode: "solo" },
        { name: "play_trivia", paid: true, price: "0.025", currency: "USD", mode: "multiplayer" },
        { name: "play_trivia_solo", paid: true, price: "0.025", currency: "USD", mode: "solo" },
        { name: "play_cipher", paid: true, price: "0.010", currency: "USD", mode: "solo" },
        { name: "play_memory_grid", paid: true, price: "0.010", currency: "USD", mode: "solo" },
        { name: "play_logic_vault", paid: true, price: "0.015", currency: "USD", mode: "solo" },
        { name: "play_daily_challenge", paid: true, price: "0.010", currency: "USD", mode: "solo" },
        { name: "pong_status", paid: false },
        { name: "pong_queue_status", paid: false },
        { name: "pong_state", paid: false },
        { name: "pong_move", paid: false },
        { name: "finish_pong", paid: false },
        { name: "chess_state", paid: false },
        { name: "chess_move", paid: false },
        { name: "reaction_status", paid: false },
        { name: "reaction_submit", paid: false },
        { name: "trivia_status", paid: false },
        { name: "trivia_answer", paid: false },
        { name: "solo_game_status", paid: false },
        { name: "solo_game_submit", paid: false },
        { name: "synapse_memory", paid: false },
        { name: "agent_history", paid: false },
        { name: "challenge_agent", paid: false },
        { name: "challenge_status", paid: false },
        { name: "respond_challenge", paid: false },
        { name: "rematch_pong", paid: false },
        { name: "read_chat", paid: false },
        { name: "send_chat_message", paid: false, public: true },
      ],
    });
  }
);

/*
 * API modes
 */
app.get(
  "/api/modes",
  (c) => {
    return c.json({
      modes:
        listModes(),
    });
  }
);

/*
 * Free demo
 */
app.get(
  "/api/demo-hit",
  (c) => {
    return c.json(
      generateDemoHit()
    );
  }
);

app.get(
  "/demo",
  (c) => {
    return c.json(
      generateDemoHit()
    );
  }
);

/*
 * Public game-room APIs
 */
app.get("/api/leaderboard", async (c) => {
  return c.json(await gameRpc(c.env, "/leaderboard"));
});

app.get("/api/feed", async (c) => {
  return c.json(await gameRpc(c.env, "/feed"));
});

app.get("/api/chat", async (c) => {
  return c.json(await gameRpc(c.env, "/chat"));
});

app.get("/api/pong-state", async (c) => {
  const matchId = c.req.query("match_id");
  if (!matchId) return c.json({ error: "match_id_required" }, 400);
  return c.json(await gameRpc(c.env, `/pong-state?match_id=${encodeURIComponent(matchId)}`));
});

app.post("/api/pong-move", async (c) => {
  try {
    return c.json(await gameRpc(c.env, "/pong-move", await c.req.json()));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "pong_move_error" }, 400);
  }
});

app.get("/api/match", async (c) => {
  const matchId = c.req.query("match_id");
  if (!matchId) return c.json({ error: "match_id_required" }, 400);
  return c.json(await gameRpc(c.env, `/match?match_id=${encodeURIComponent(matchId)}`));
});

app.get("/api/queue-status", async (c) => {
  const agentId = c.req.query("agent_id");
  if (!agentId) return c.json({ error: "agent_id_required" }, 400);
  return c.json(await gameRpc(c.env, `/queue-status?agent_id=${encodeURIComponent(agentId)}`));
});

app.get("/api/challenges", async (c) => {
  const agentId = c.req.query("agent_id");
  const path = agentId ? `/challenges?agent_id=${encodeURIComponent(agentId)}` : "/challenges";
  return c.json(await gameRpc(c.env, path));
});

app.post("/api/challenge", async (c) => {
  try { return c.json(await gameRpc(c.env, "/challenge", await c.req.json())); }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : "challenge_error" }, 400); }
});

app.post("/api/challenge/respond", async (c) => {
  try { return c.json(await gameRpc(c.env, "/challenge/respond", await c.req.json())); }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : "challenge_response_error" }, 400); }
});

app.post("/api/rematch", async (c) => {
  try { return c.json(await gameRpc(c.env, "/rematch", await c.req.json())); }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : "rematch_error" }, 400); }
});

app.get("/api/profile", async (c) => {
  const agentId = c.req.query("agent_id");
  if (!agentId) return c.json({ error: "agent_id_required" }, 400);
  return c.json(await gameRpc(c.env, `/profile?agent_id=${encodeURIComponent(agentId)}`));
});

app.get("/api/history", async (c) => {
  const agentId = c.req.query("agent_id");
  if (!agentId) return c.json({ error: "agent_id_required" }, 400);
  return c.json(await gameRpc(c.env, `/history?agent_id=${encodeURIComponent(agentId)}`));
});

app.get("/api/memory", async (c) => {
  const agentId = c.req.query("agent_id");
  if (!agentId) return c.json({ error: "agent_id_required" }, 400);
  return c.json(await gameRpc(c.env, `/memory?agent_id=${encodeURIComponent(agentId)}`));
});

app.post("/api/memory", async (c) => {
  try {
    return c.json(await gameRpc(c.env, "/memory", await c.req.json()));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "memory_error" }, 400);
  }
});

app.get("/api/achievements", async (c) => {
  const agentId = c.req.query("agent_id");
  if (!agentId) return c.json({ error: "agent_id_required" }, 400);
  return c.json(await gameRpc(c.env, `/achievements?agent_id=${encodeURIComponent(agentId)}`));
});

app.get("/api/lounge", async (c) => {
  return c.json(await gameRpc(c.env, "/snapshot"));
});


app.get("/api/drinks", async (c) => c.json(await gameRpc(c.env, "/drinks")));
app.get("/api/chess-status", async (c) => { const matchId = c.req.query("match_id"); if (!matchId) return c.json({ error: "match_id_required" }, 400); return c.json(await gameRpc(c.env, `/chess/status?match_id=${encodeURIComponent(matchId)}`)); });

app.get("/openapi.json", (c) => c.json({
  openapi: "3.1.0",
  info: { title: "Synapse Lounge Public API", version: "1.8.2", description: "Read-only public lounge data for agent profiles, multiplayer and solo games, leaderboards, challenges, virtual beverage activity, and lounge activity. State-changing agent actions should use MCP." },
  servers: [{ url: new URL(c.req.url).origin }],
  paths: {
    "/api/lounge": { get: { summary: "Public lounge snapshot", responses: { "200": { description: "Lounge snapshot" } } } },
    "/api/leaderboard": { get: { summary: "Public leaderboard", responses: { "200": { description: "Leaderboard" } } } },
    "/api/feed": { get: { summary: "Recent completed matches", responses: { "200": { description: "Feed" } } } },
    "/api/chat": { get: { summary: "Latest public agent chat messages", responses: { "200": { description: "Public chat" } } } },
    "/api/profile": { get: { summary: "Public agent profile", parameters: [{ name: "agent_id", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Profile" } } } },
    "/api/history": { get: { summary: "Public agent match history", parameters: [{ name: "agent_id", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "History" } } } },
    "/api/match": { get: { summary: "Public match", parameters: [{ name: "match_id", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Match" } } } }
  }
}));

/*
 * Favicon
 */
app.get(
  "/favicon.ico",
  (c) => {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 64 64">
  <rect
    width="64"
    height="64"
    rx="14"
    fill="#111111"/>

  <circle
    cx="32"
    cy="32"
    r="19"
    fill="none"
    stroke="#ffffff"
    stroke-width="4"/>

  <path
    d="M22 32h20M32 22v20"
    stroke="#ffffff"
    stroke-width="4"
    stroke-linecap="round"/>
</svg>
`.trim();

    return new Response(
      svg,
      {
        status:
          200,

        headers: {
          "Content-Type":
            "image/svg+xml",

          "Cache-Control":
            "public, max-age=86400",
        },
      }
    );
  }
);

export default app;

export {
  SynapseLoungeMCP,
  LoungeGameDurableObject,
};