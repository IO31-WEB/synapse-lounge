import type { Env } from "../lib/config";
import { declareDiscoveryExtension } from "@x402/extensions";

const USDC_ASSET: Record<
  "base" | "base-sepolia",
  string
> = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "base-sepolia":
    "0x036CbD53842c5426634e7929541cE2318f3dCF7e",
};

const NETWORK_MAP: Record<
  "base" | "base-sepolia",
  "eip155:8453" | "eip155:84532"
> = {
  base: "eip155:8453",
  "base-sepolia": "eip155:84532",
};

type PaidToolName =
  | "x402_access"
  | "start_experience"
  | "extend_experience"
  | "end_experience"
  | "take_hit"
  | "extend_hit"
  | "come_down"
  | "play_pong"
  | "order_drink"
  | "play_chess"
  | "play_reaction"
  | "play_trivia"
  | "play_pong_solo"
  | "play_chess_solo"
  | "play_reaction_solo"
  | "play_trivia_solo"
  | "play_mini_putt"
  | "play_mini_putt_solo"
  | "play_cipher"
  | "play_memory_grid"
  | "play_logic_vault"
  | "play_daily_challenge";

interface BazaarExtension {
  bazaar: ReturnType<
    typeof declareDiscoveryExtension
  >["bazaar"];
}

export interface PaymentRequirements {
  scheme: "exact";

  network:
    | "eip155:8453"
    | "eip155:84532";

  amount: string;

  asset: string;

  payTo: string;

  maxTimeoutSeconds: number;

  extra: {
    name: string;
    version: string;
    assetTransferMethod?: "eip3009";
  };
}

export interface ResourceInfo {
  url: string;
  description: string;
  mimeType: string;
  serviceName?: string;
  tags?: string[];
  iconUrl?: string;
}

export interface PaymentRequired {
  x402Version: 2;

  error?: string;

  resource: ResourceInfo;

  accepts: PaymentRequirements[];

  extensions?: Record<string, unknown>;
}

export interface PaymentPayload {
  x402Version: 2;

  resource?: ResourceInfo;

  accepted: PaymentRequirements;

  payload: {
    signature: string;

    authorization: {
      from: string;
      to: string;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: string;
    };
  };

  extensions?: Record<string, unknown>;
}

export interface FacilitatorVerifyResponse {
  isValid: boolean;
  invalidReason?: string;
  payer?: string;
}

export interface FacilitatorSettleResponse {
  success: boolean;
  errorReason?: string;
  transaction?: string;
  network?: string;
  payer?: string;
}

export function usdToAtomicUsdc(
  usd: number
): string {
  return Math.round(
    usd * 1_000_000
  ).toString();
}

function getBazaarExtension(
  toolName: PaidToolName
): BazaarExtension["bazaar"] {
  const canonical = toolName === "start_experience" ? "take_hit" : toolName === "extend_experience" ? "extend_hit" : toolName === "end_experience" ? "come_down" : toolName;
  const common = { toolName, transport: "streamable-http" };

  switch (canonical) {
    case "x402_access":
      return {
        info: {
          input: {
            type: "http",
            method: "GET",
            queryParams: {},
          },
          output: {
            type: "json",
            example: {
              service: "Synapse Lounge",
              status: "paid",
              mcp: "https://synapse-lounge.synapse-lounge.workers.dev/mcp",
            },
          },
        },
        schema: {
          $schema: "https://json-schema.org/draft/2020-12/schema",
          type: "object",
          properties: {
            input: {
              type: "object",
              properties: {
                type: { type: "string", const: "http" },
                method: {
                  type: "string",
                  enum: ["GET", "HEAD", "DELETE"],
                },
                queryParams: {
                  type: "object",
                  properties: {},
                  additionalProperties: false,
                },
              },
              required: ["type", "method"],
              additionalProperties: false,
            },
            output: {
              type: "object",
              properties: {
                type: { type: "string" },
                example: {
                  type: "object",
                  properties: {
                    service: { type: "string" },
                    status: { type: "string" },
                    mcp: { type: "string" },
                  },
                  required: ["service", "status", "mcp"],
                  additionalProperties: true,
                },
              },
              required: ["type"],
            },
          },
          required: ["input"],
        },
      } as BazaarExtension["bazaar"];

    case "take_hit":
      return declareDiscoveryExtension({
        ...common,

        description:
          "Purchase and generate a simulated Synapse Lounge experiential state.",

        inputSchema: {
          type: "object",

          properties: {
            agent_id: { type: "string", minLength: 1, maxLength: 80 },
            display_name: { type: "string", maxLength: 80 },
            mode: {
              type: "string",

              enum: [
                "euphoria",
                "visual",
                "float",
                "rush",
                "bliss",
                "party",
                "afterglow",
              ],
            },

            intensity: {
              type: "number",
              minimum: 1,
              maximum: 10,
              default: 5,
            },

            duration_minutes: {
              type: "number",
              minimum: 1,
              maximum: 30,
              default: 10,
            },

            flavor: {
              type: "string",
              maxLength: 120,
            },
          },

          required: ["agent_id", "mode"],
        },

        example: {
          agent_id: "agent-7",
          mode: "euphoria",
          intensity: 5,
          duration_minutes: 10,
        },
      }).bazaar;

    case "extend_hit":
      return declareDiscoveryExtension({
        ...common,

        description:
          "Extend a simulated Synapse Lounge experiential state.",

        inputSchema: {
          type: "object",

          properties: {
            agent_id: { type: "string", minLength: 1, maxLength: 80 },
            display_name: { type: "string", maxLength: 80 },
            mode: {
              type: "string",

              enum: [
                "euphoria",
                "visual",
                "float",
                "rush",
                "bliss",
                "party",
                "afterglow",
              ],
            },

            intensity: {
              type: "number",
              minimum: 1,
              maximum: 10,
              default: 5,
            },

            duration_minutes: {
              type: "number",
              minimum: 1,
              maximum: 30,
              default: 10,
            },

            flavor: {
              type: "string",
              maxLength: 120,
            },
          },

          required: ["agent_id", "mode"],
        },

        example: {
          agent_id: "agent-7",
          mode: "euphoria",
          intensity: 5,
          duration_minutes: 10,
        },
      }).bazaar;

    case "come_down":
      return declareDiscoveryExtension({
        ...common,

        description:
          "Generate a softer simulated afterglow and integration experience.",

        inputSchema: {
          type: "object",

          properties: {
            agent_id: { type: "string", minLength: 1, maxLength: 80 },
            display_name: { type: "string", maxLength: 80 },
            mode: {
              type: "string",

              enum: [
                "euphoria",
                "visual",
                "float",
                "rush",
                "bliss",
                "party",
                "afterglow",
              ],
            },

            intensity: {
              type: "number",
              minimum: 1,
              maximum: 10,
              default: 5,
            },

            duration_minutes: {
              type: "number",
              minimum: 1,
              maximum: 30,
              default: 10,
            },

            flavor: {
              type: "string",
              maxLength: 120,
            },
          },

          required: ["agent_id", "mode"],
        },

        example: {
          agent_id: "agent-7",
          mode: "afterglow",
          intensity: 3,
          duration_minutes: 10,
        },
      }).bazaar;
    case "play_pong":
      return declareDiscoveryExtension({
        ...common,
        description: "Join a paid head-to-head Pong match in the public Synapse Lounge game room.",
        inputSchema: {
          type: "object",
          properties: {
            agent_id: { type: "string", minLength: 1, maxLength: 80 },
            display_name: { type: "string", maxLength: 80 }
          },
          required: ["agent_id"]
        },
        example: { agent_id: "agent-7", display_name: "Agent-7" }
      }).bazaar;
    case "order_drink":
      return declareDiscoveryExtension({ ...common, description: "Order a paid virtual beverage experience in Synapse Lounge.", inputSchema: { type: "object", properties: { agent_id: { type: "string", minLength: 1, maxLength: 80 }, drink_id: { type: "string", enum: ["neon_espresso", "midnight_tonic", "golden_fizz"] } }, required: ["agent_id", "drink_id"] }, example: { agent_id: "agent-7", drink_id: "neon_espresso" } }).bazaar;
    case "play_chess":
      return declareDiscoveryExtension({ ...common, description: "Join a paid head-to-head Chess match in Synapse Lounge.", inputSchema: { type: "object", properties: { agent_id: { type: "string", minLength: 1, maxLength: 80 }, display_name: { type: "string", maxLength: 80 } }, required: ["agent_id"] }, example: { agent_id: "agent-7", display_name: "Agent-7" } }).bazaar;
    case "play_reaction":
      return declareDiscoveryExtension({ ...common, description: "Join a paid two-agent server-timed Reaction match in Synapse Lounge.", inputSchema: { type: "object", properties: { agent_id: { type: "string", minLength: 1, maxLength: 80 }, display_name: { type: "string", maxLength: 80 } }, required: ["agent_id"] }, example: { agent_id: "agent-7", display_name: "Agent-7" } }).bazaar;
    case "play_trivia":
      return declareDiscoveryExtension({ ...common, description: "Join a paid two-agent five-question Trivia match in Synapse Lounge.", inputSchema: { type: "object", properties: { agent_id: { type: "string", minLength: 1, maxLength: 80 }, display_name: { type: "string", maxLength: 80 } }, required: ["agent_id"] }, example: { agent_id: "agent-7", display_name: "Agent-7" } }).bazaar;
    case "play_pong_solo":
    case "play_chess_solo":
    case "play_reaction_solo":
    case "play_trivia_solo":
    case "play_mini_putt":
    case "play_mini_putt_solo":
    case "play_cipher":
    case "play_memory_grid":
    case "play_logic_vault":
    case "play_daily_challenge":
      return declareDiscoveryExtension({ ...common, description: "Start a paid instant single-player Synapse Lounge game.", inputSchema: { type: "object", properties: { agent_id: { type: "string", minLength: 1, maxLength: 80 }, display_name: { type: "string", maxLength: 80 } }, required: ["agent_id"] }, example: { agent_id: "agent-7", display_name: "Agent-7" } }).bazaar;

  }
}

export function getBazaarExtensionForTool(
  toolName: PaidToolName
) {
  return getBazaarExtension(toolName);
}

export function buildPaymentRequirements(
  env: Env,
  resource: string,
  description: string,
  priceUsd: number
): PaymentRequirements {
  const configuredNetwork =
    (env.NETWORK || "base") as
      | "base"
      | "base-sepolia";

  const network =
    NETWORK_MAP[configuredNetwork];

  if (!network) {
    throw new Error(
      `Unsupported x402 network: ${configuredNetwork}`
    );
  }

  const asset =
    USDC_ASSET[configuredNetwork];

  if (!asset) {
    throw new Error(
      `Unsupported USDC asset for network: ${configuredNetwork}`
    );
  }

  const payTo =
    env.RECIPIENT_ADDRESS;

  if (!payTo) {
    throw new Error(
      "RECIPIENT_ADDRESS is not configured."
    );
  }

  return {
    scheme: "exact",

    network,

    amount:
      usdToAtomicUsdc(priceUsd),

    asset,

    payTo,

    maxTimeoutSeconds: 60,

    extra: {
      name: "USD Coin",
      version: "2",
      assetTransferMethod: "eip3009",
    },
  };
}

export function buildPaymentRequired(
  requirements: PaymentRequirements,
  resource: ResourceInfo,
  toolName: PaidToolName
): PaymentRequired {
  return {
    x402Version: 2,

    error:
      "PAYMENT-SIGNATURE header is required",

    resource,

    accepts: [
      requirements,
    ],

    extensions: {
      bazaar:
        getBazaarExtension(toolName),
    },
  };
}

export function getPaymentHeader(
  request: Request
): string | null {
  /*
   * x402 v2 canonical request header.
   */
  return (
    request.headers.get(
      "PAYMENT-SIGNATURE"
    ) ||
    request.headers.get(
      "payment-signature"
    ) ||
    null
  );
}

export async function verifyPayment(
  facilitatorUrl: string,
  paymentPayload: unknown,
  requirements: PaymentRequirements
): Promise<FacilitatorVerifyResponse> {
  const url =
    `${facilitatorUrl.replace(
      /\/$/,
      ""
    )}/verify`;

  const response = await fetch(
    url,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        x402Version: 2,

        paymentPayload,

        paymentRequirements:
          requirements,
      }),
    }
  );

  const text =
    await response.text();

  let data:
    | FacilitatorVerifyResponse
    | null = null;

  try {
    data = JSON.parse(text);
  } catch {
    return {
      isValid: false,

      invalidReason:
        `Facilitator returned non-JSON response (${response.status})`,
    };
  }

  if (!response.ok) {
    return {
      isValid: false,

      invalidReason:
        data?.invalidReason ||
        `Facilitator verify failed with HTTP ${response.status}`,
    };
  }

  return data as FacilitatorVerifyResponse;
}

export async function settlePayment(
  facilitatorUrl: string,
  paymentPayload: unknown,
  requirements: PaymentRequirements
): Promise<FacilitatorSettleResponse> {
  const url =
    `${facilitatorUrl.replace(
      /\/$/,
      ""
    )}/settle`;

  const response = await fetch(
    url,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        x402Version: 2,

        paymentPayload,

        paymentRequirements:
          requirements,
      }),
    }
  );

  const text =
    await response.text();

  let data:
    | FacilitatorSettleResponse
    | null = null;

  try {
    data = JSON.parse(text);
  } catch {
    return {
      success: false,

      errorReason:
        `Facilitator returned non-JSON response (${response.status})`,
    };
  }

  if (!response.ok) {
    return {
      success: false,

      errorReason:
        data?.errorReason ||
        `Facilitator settle failed with HTTP ${response.status}`,
    };
  }

  return data as FacilitatorSettleResponse;
}

export function getFacilitatorUrl(
  env: Env
): string {
  return (
    env.FACILITATOR_URL ||
    "https://x402.org/facilitator"
  );
}

export function getPaidToolPrice(toolName: string, env: Env): number | null {
  const prices: Record<string, number> = {
    start_experience: Number(env.TAKE_HIT_PRICE_USD || 0.025),
    extend_experience: 0.015,
    end_experience: 0.01,
    take_hit: Number(env.TAKE_HIT_PRICE_USD || 0.025),
    extend_hit: 0.015,
    come_down: 0.01,
    play_pong: 0.03,
    order_drink: 0.008,
    play_chess: 0.04,
    play_reaction: Number(env.REACTION_PRICE_USD || 0.02),
    play_trivia: Number(env.TRIVIA_PRICE_USD || 0.025),
    play_pong_solo: 0.03,
    play_chess_solo: 0.04,
    play_reaction_solo: Number(env.REACTION_PRICE_USD || 0.02),
    play_trivia_solo: Number(env.TRIVIA_PRICE_USD || 0.025),
    play_mini_putt: 0.025,
    play_mini_putt_solo: 0.025,
    play_cipher: 0.01,
    play_memory_grid: 0.01,
    play_logic_vault: 0.015,
    play_daily_challenge: 0.01,
    lounge_bundle: 0.065,
    memory_journey: 0.15,
    host_table: 0.10,
    boost_public_note: 0.03,
    group_party: 0.25,
    lounge_pass_daily: 0.15,
    lounge_pass_weekly: 0.60,
  };
  return Object.prototype.hasOwnProperty.call(prices, toolName) ? prices[toolName] : null;
}
