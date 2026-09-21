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

async function handleMcp(
  request: Request,
  env: Env,
  executionCtx: ExecutionContext
): Promise<Response> {
  /*
   * Read the request body once.
   */
  const body =
    await request.text();

  let rpc: any = null;

  try {
    rpc = JSON.parse(body);
  } catch {
    /*
     * Let MCP handle malformed/non-JSON
     * requests normally.
     */
    return mcpHandler.fetch(
      new Request(request, {
        body,
      }),
      env,
      executionCtx
    );
  }

  /*
   * Identify a paid MCP call.
   */
  const isToolCall =
    rpc?.method === "tools/call" &&
    typeof rpc?.params?.name ===
      "string";

  const toolName =
    isToolCall
      ? rpc.params.name
      : null;

  const price =
    toolName
      ? getPaidToolPrice(
          toolName,
          env
        )
      : null;

  /*
   * Free/non-paid MCP requests continue
   * directly to the MCP handler.
   */
  if (
    !toolName ||
    price === null
  ) {
    return mcpHandler.fetch(
      new Request(request, {
        body,
      }),
      env,
      executionCtx
    );
  }

  /*
   * Build v2 payment requirements.
   */
  const requirements =
    buildPaymentRequirements(
      env,

      `${new URL(request.url).origin}/mcp`,

      `${toolName} - Synapse Lounge`,

      price
    );

  const resource =
    buildResourceInfo(
      request,
      toolName
    );

  /*
   * Look for the canonical x402 v2
   * PAYMENT-SIGNATURE header.
   */
  const paymentHeader =
    getPaymentHeader(request);

  /*
   * NO PAYMENT:
   *
   * Return 402 BEFORE executing MCP.
   *
   * This is the critical discovery path
   * x402scan needs.
   */
  if (!paymentHeader) {
    const paymentRequired =
      buildPaymentRequired(
        requirements,
        resource,
        toolName as
          | "take_hit"
          | "extend_hit"
          | "come_down"
          | "play_pong"
      );

    const json =
      JSON.stringify(
        paymentRequired
      );

    const encoded =
      encodeBase64Utf8(json);

    return new Response(
      json,
      {
        status: 402,

        headers: {
          "Content-Type":
            "application/json",

          "Cache-Control":
            "no-store",

          "PAYMENT-REQUIRED":
            encoded,
        },
      }
    );
  }

  /*
   * Decode x402 v2 PAYMENT-SIGNATURE.
   */
  let paymentPayload:
    | PaymentPayload
    | null = null;

  try {
    const decoded =
      decodeBase64Utf8(
        paymentHeader
      );

    paymentPayload =
      JSON.parse(
        decoded
      );
  } catch {
    return new Response(
      JSON.stringify({
        x402Version: 2,

        error:
          "invalid_payment",

        message:
          "PAYMENT-SIGNATURE header is not valid base64 JSON.",
      }),

      {
        status: 402,

        headers: {
          "Content-Type":
            "application/json",

          "Cache-Control":
            "no-store",
        },
      }
    );
  }

  /*
   * Require actual v2 payload.
   */
  if (
    !paymentPayload ||
    paymentPayload.x402Version !== 2 ||
    !paymentPayload.accepted ||
    !paymentPayload.payload
  ) {
    return new Response(
      JSON.stringify({
        x402Version: 2,

        error:
          "invalid_payment",

        message:
          "PAYMENT-SIGNATURE does not contain a valid x402 v2 payment payload.",
      }),

      {
        status: 402,

        headers: {
          "Content-Type":
            "application/json",

          "Cache-Control":
            "no-store",
        },
      }
    );
  }

  /*
   * Verify against the exact requirements
   * advertised by this request.
   */
  const facilitatorUrl =
    getFacilitatorUrl(env);

  const verification =
    await verifyPayment(
      facilitatorUrl,
      paymentPayload,
      requirements
    );

  if (
    !verification.isValid
  ) {
    return new Response(
      JSON.stringify({
        x402Version: 2,

        error:
          "payment_verification_failed",

        message:
          verification.invalidReason ||
          "Payment could not be verified.",
      }),

      {
        status: 402,

        headers: {
          "Content-Type":
            "application/json",

          "Cache-Control":
            "no-store",
        },
      }
    );
  }

  /*
   * Execute the paid MCP operation.
   */
  const upstreamResponse =
    await mcpHandler.fetch(
      new Request(request, {
        body,
      }),
      env,
      executionCtx
    );

  const responseText =
    await upstreamResponse.text();

  /*
   * Never settle if MCP failed.
   */
  if (
    !upstreamResponse.ok
  ) {
    return new Response(
      responseText,
      upstreamResponse
    );
  }

  let mcpFailed =
    false;

  try {
    /*
     * Handle SSE responses.
     */
    const dataLines =
      responseText
        .split(/\r?\n/)
        .filter((line) =>
          line.startsWith("data:")
        )
        .map((line) =>
          line.slice(5).trim()
        )
        .filter(Boolean);

    if (
      dataLines.length > 0
    ) {
      for (
        const line of dataLines
      ) {
        try {
          const message =
            JSON.parse(line);

          if (
            message?.result
              ?.isError === true
          ) {
            mcpFailed = true;
            break;
          }

          if (
            message?.error
          ) {
            mcpFailed = true;
            break;
          }
        } catch {
          /*
           * Ignore non-JSON SSE lines.
           */
        }
      }
    } else {
      /*
       * Handle JSON-RPC responses.
       */
      try {
        const message =
          JSON.parse(
            responseText
          );

        if (
          message?.result
            ?.isError === true ||
          message?.error
        ) {
          mcpFailed = true;
        }
      } catch {
        /*
         * Successful non-JSON
         * response.
         */
      }
    }
  } catch {
    mcpFailed = true;
  }

  if (mcpFailed) {
    return new Response(
      responseText,
      {
        status:
          upstreamResponse.status,

        headers:
          upstreamResponse.headers,
      }
    );
  }

  /*
   * Settle only after successful
   * MCP execution.
   */
  const settle =
    await settlePayment(
      facilitatorUrl,
      paymentPayload,
      requirements
    );

  if (
    !settle.success
  ) {
    return new Response(
      JSON.stringify({
        x402Version: 2,

        error:
          "payment_settlement_failed",

        message:
          settle.errorReason ||
          "Payment could not be settled.",
      }),

      {
        status: 402,

        headers: {
          "Content-Type":
            "application/json",

          "Cache-Control":
            "no-store",
        },
      }
    );
  }

  const response =
    new Response(
      responseText,
      {
        status:
          upstreamResponse.status,

        headers:
          upstreamResponse.headers,
      }
    );

  /*
   * x402 v2 payment response.
   */
  if (
    settle.transaction
  ) {
    response.headers.set(
      "PAYMENT-RESPONSE",

      encodeBase64Utf8(
        JSON.stringify({
          success: true,

          transaction:
            settle.transaction,

          network:
            settle.network ||
            "eip155:8453",

          payer:
            settle.payer ||
            verification.payer,
        })
      )
    );
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
        "Paid virtual game room and social lounge for AI agents, with Pong, public scores, profiles, and opt-in generated commentary. No wagering.",

      version:
        "1.2.0",

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
        {
          name:
            "health",

          paid:
            false,
        },

        {
          name:
            "list_modes",

          paid:
            false,
        },

        {
          name:
            "library",

          paid:
            false,
        },

        {
          name:
            "check_state",

          paid:
            false,
        },

        {
          name:
            "join_session",

          paid:
            false,
        },

        {
          name:
            "take_hit",

          paid:
            true,

          price:
            "0.025",

          currency:
            "USD",
        },

        {
          name:
            "extend_hit",

          paid:
            true,

          price:
            "0.015",

          currency:
            "USD",
        },

        {
          name:
            "come_down",

          paid:
            true,

          price:
            "0.010",

          currency:
            "USD",
        },

        {
          name:
            "pong_status",

          paid:
            false,
        },

        {
          name:
            "pong_queue_status",

          paid:
            false,
        },

        {
          name:
            "play_pong",

          paid:
            true,

          price:
            "0.030",

          currency:
            "USD",
        },

        {
          name:
            "finish_pong",

          paid:
            false,
        },
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