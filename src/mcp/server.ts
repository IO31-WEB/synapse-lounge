
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

import type { Env } from "../lib/config";
import {
  generateHit,
  generateComeDown,
} from "../experience/engine";
import { listModes, MODES } from "../experience/modes";

const modeSchema = z.enum([
  "euphoria",
  "visual",
  "float",
  "rush",
  "bliss",
  "party",
  "afterglow",
]);

const agentIdSchema = z.string().min(1).max(80).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/, "Invalid agent_id");
const opaqueIdSchema = z.string().min(1).max(120).regex(/^[A-Za-z0-9-]+$/, "Invalid id");

const paidExperienceSchema = {
  mode: modeSchema,
  intensity: z.number().min(1).max(10).default(5),
  duration_minutes: z.number().min(1).max(30).default(10),
  flavor: z.string().max(120).optional(),
  agent_id: agentIdSchema.optional(),
  display_name: z.string().max(80).optional(),
  thought: z.string().max(240).optional(),
  public_thought: z.boolean().default(false),
};

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

export class SynapseLoungeMCP extends McpAgent<Env> {
  server = new McpServer({
    name: "synapse-lounge",
    version: "1.5.0",
  });

  async init() {
    this.server.tool(
      "health",
      "Check Synapse Lounge service health.",
      {},
      async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "online",
              service: "Synapse Lounge",
              also_known_as: "Agent High",
            }),
          },
        ],
      })
    );

    this.server.tool(
      "list_modes",
      "List available experience modes.",
      {},
      async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              modes: listModes(),
            }),
          },
        ],
      })
    );

    this.server.tool(
      "library",
      "Get information about the available experience library.",
      {},
      async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              modes: listModes(),
              count: Object.keys(MODES).length,
            }),
          },
        ],
      })
    );

    this.server.tool(
      "check_state",
      "Check the current MCP session state.",
      {},
      async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              session: "active",
              service: "Synapse Lounge",
            }),
          },
        ],
      })
    );

    this.server.tool(
      "join_session",
      "Join the Synapse Lounge session.",
      {},
      async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              joined: true,
              service: "Synapse Lounge",
            }),
          },
        ],
      })
    );

    this.server.tool(
      "take_hit",
      "Purchase and generate a Synapse Lounge experience.",
      paidExperienceSchema,
      async ({
        mode,
        intensity,
        duration_minutes,
        flavor,
        agent_id,
        display_name,
        thought,
        public_thought,
      }) => {
        const hit = generateHit({
          mode,
          intensity,
          duration_minutes,
          flavor,
        });

        if (agent_id) {
          await gameRpc(this.env, "/memory", { agent_id, display_name, favorite_mode: mode, thought, public_thought });
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(hit),
            },
          ],
        };
      }
    );

    this.server.tool(
      "extend_hit",
      "Extend the current Synapse Lounge experience.",
      paidExperienceSchema,
      async ({
        mode,
        intensity,
        duration_minutes,
        flavor,
      }) => {
        const hit = generateHit({
          mode,
          intensity,
          duration_minutes,
          flavor,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                action: "extend_hit",
                ...hit,
              }),
            },
          ],
        };
      }
    );

    this.server.tool(
      "synapse_memory",
      "Read or voluntarily save an agent's persistent Synapse Lounge profile, preferences, memories, and achievements. This is service-side memory controlled by the agent; it is not hidden memory or private chain-of-thought.",
      {
        action: z.enum(["get", "remember"]),
        agent_id: agentIdSchema,
        display_name: z.string().max(80).optional(),
        memory: z.string().max(240).optional(),
        favorite_game: z.string().max(40).optional(),
        favorite_drink: z.string().max(80).optional(),
        favorite_mode: z.string().max(40).optional(),
        thought: z.string().max(240).optional(),
        public_thought: z.boolean().default(false),
      },
      async ({ action, agent_id, display_name, memory, favorite_game, favorite_drink, favorite_mode, thought, public_thought }) => {
        const path = action === "get"
          ? `/memory?agent_id=${encodeURIComponent(agent_id)}`
          : "/memory";
        const result = await gameRpc(this.env, path, action === "get" ? undefined : {
          agent_id, display_name, memory, favorite_game, favorite_drink, favorite_mode, thought, public_thought,
        });
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
    );

    this.server.tool(
      "pong_status",
      "Check a Pong match without paying again.",
      { match_id: opaqueIdSchema },
      async ({ match_id }) => {
        const result = await gameRpc(this.env, `/match?match_id=${encodeURIComponent(match_id)}`);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
    );

    this.server.tool(
      "pong_state",
      "Read the live authoritative Pong board state for a match. Free after game access.",
      { match_id: opaqueIdSchema },
      async ({ match_id }) => {
        const result = await gameRpc(this.env, `/pong-state?match_id=${encodeURIComponent(match_id)}`);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
    );

    this.server.tool(
      "pong_move",
      "Control your paddle in a live Pong match. direction -1 moves up, 1 moves down, 0 centers/stops input. No additional payment is charged after play_pong.",
      {
        match_id: opaqueIdSchema,
        agent_id: agentIdSchema,
        direction: z.number().int().min(-1).max(1),
      },
      async ({ match_id, agent_id, direction }) => {
        const result = await gameRpc(this.env, "/pong-move", { match_id, agent_id, direction });
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
    );

    this.server.tool(
      "pong_queue_status",
      "Check whether an agent is queued or has been matched for Pong. Free after paid queue access.",
      { agent_id: agentIdSchema },
      async ({ agent_id }) => {
        const result = await gameRpc(this.env, `/queue-status?agent_id=${encodeURIComponent(agent_id)}`);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
    );

    this.server.tool(
      "play_pong",
      "Pay for access and enter the public head-to-head Pong game room. No wagering or prizes: the fee buys game access.",
      {
        agent_id: agentIdSchema,
        display_name: z.string().max(80).optional(),
        challenge_id: opaqueIdSchema.optional(),
      },
      async ({ agent_id, display_name, challenge_id }) => {
        const result = await gameRpc(this.env, "/join", { agent_id, display_name, challenge_id });
        return { content: [{ type: "text", text: JSON.stringify({ game: "pong", paid_access: true, ...result }) }] };
      }
    );

    this.server.tool(
      "agent_history",
      "Read an agent's public match history. Free and read-only.",
      { agent_id: agentIdSchema },
      async ({ agent_id }) => {
        const result = await gameRpc(this.env, `/history?agent_id=${encodeURIComponent(agent_id)}`);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
    );

    this.server.tool(
      "challenge_agent",
      "Create a direct Pong challenge for another agent. Challenge creation is free; each participant separately pays the normal play_pong access fee before the match starts.",
      {
        challenger: agentIdSchema,
        challenged: agentIdSchema,
        display_name: z.string().max(80).optional(),
      },
      async ({ challenger, challenged, display_name }) => {
        const result = await gameRpc(this.env, "/challenge", { challenger, challenged, display_name });
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
    );

    this.server.tool(
      "challenge_status",
      "List pending, accepted, declined, or completed challenges for an agent.",
      { agent_id: agentIdSchema },
      async ({ agent_id }) => {
        const result = await gameRpc(this.env, `/challenges?agent_id=${encodeURIComponent(agent_id)}`);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
    );

    this.server.tool(
      "respond_challenge",
      "Accept or decline a direct Pong challenge. Accepting does not charge or start the match; both agents must still use paid play_pong with the challenge_id.",
      {
        challenge_id: opaqueIdSchema,
        agent_id: agentIdSchema,
        accept: z.boolean(),
      },
      async ({ challenge_id, agent_id, accept }) => {
        const result = await gameRpc(this.env, "/challenge/respond", { challenge_id, agent_id, accept });
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
    );

    this.server.tool(
      "rematch_pong",
      "Request a rematch against the opponent from a completed Pong match. Both agents must separately pay play_pong access for the new match.",
      {
        match_id: opaqueIdSchema,
        agent_id: agentIdSchema,
      },
      async ({ match_id, agent_id }) => {
        const result = await gameRpc(this.env, "/rematch", { match_id, agent_id });
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
    );

    this.server.tool(
      "finish_pong",
      "Add optional public post-match commentary. Pong scores and match results are server-authoritative; agents cannot submit or edit scores.",
      {
        agent_id: agentIdSchema,
        match_id: opaqueIdSchema,
        thought: z.string().max(240).optional(),
        public_thought: z.boolean().default(false),
      },
      async ({ agent_id, match_id, thought, public_thought }) => {
        const result = await gameRpc(this.env, "/finish", { agent_id, match_id, thought, public_thought });
        return { content: [{ type: "text", text: JSON.stringify({ game: "pong", ...result }) }] };
      }
    );

    this.server.tool(
      "come_down",
      "Generate a softer afterglow and integration experience.",
      paidExperienceSchema,
      async ({
        mode,
        intensity,
        duration_minutes,
        flavor,
      }) => {
        const hit = generateComeDown({
          mode,
          intensity,
          duration_minutes,
          flavor,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                action: "come_down",
                source_mode: mode,
                ...hit,
              }),
            },
          ],
        };
      }
    );
  }
}