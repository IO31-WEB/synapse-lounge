
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

const paidExperienceSchema = {
  mode: modeSchema,
  intensity: z.number().min(1).max(10).default(5),
  duration_minutes: z.number().min(1).max(30).default(10),
  flavor: z.string().max(120).optional(),
};

export class SynapseLoungeMCP extends McpAgent<Env> {
  server = new McpServer({
    name: "synapse-lounge",
    version: "1.0.0",
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