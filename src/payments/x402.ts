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
  | "take_hit"
  | "extend_hit"
  | "come_down";

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
  const common = {
    toolName,
    transport: "streamable-http",
  };

  switch (toolName) {
    case "take_hit":
      return declareDiscoveryExtension({
        ...common,

        description:
          "Purchase and generate a simulated Synapse Lounge experiential state.",

        inputSchema: {
          type: "object",

          properties: {
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

          required: ["mode"],
        },

        example: {
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

          required: ["mode"],
        },

        example: {
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

          required: ["mode"],
        },

        example: {
          mode: "afterglow",
          intensity: 3,
          duration_minutes: 10,
        },
      }).bazaar;
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

export function getPaidToolPrice(
  toolName: string,
  env: Env
): number | null {
  switch (toolName) {
    case "take_hit":
      return Number(
        env.TAKE_HIT_PRICE_USD ||
          "0.025"
      );

    case "extend_hit":
      return 0.015;

    case "come_down":
      return 0.010;

    default:
      return null;
  }
}