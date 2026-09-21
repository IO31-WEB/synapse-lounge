import { Hono } from "hono";

import { SynapseLoungeMCP } from "./mcp/server";
import type { Env } from "./lib/config";

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
app.get(
  "/",
  (c) => {
    const origin =
      new URL(c.req.url).origin;

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>Synapse Lounge - MCP for AI Agents</title>

  <meta
    name="description"
    content="Synapse Lounge is a paid remote MCP service providing simulated experiential states for AI agents through x402 USDC micropayments on Base."
  >

  <link rel="icon" href="/favicon.ico">

  <style>
    :root {
      color-scheme: dark;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family:
        Inter,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

      background: #0b0b0b;
      color: #f5f5f5;
      line-height: 1.6;
    }

    main {
      max-width: 900px;
      margin: 0 auto;
      padding: 72px 24px;
    }

    .badge {
      display: inline-block;
      padding: 6px 10px;
      border: 1px solid #333;
      border-radius: 999px;
      font-size: 13px;
      color: #aaa;
      margin-bottom: 20px;
    }

    h1 {
      font-size: clamp(42px, 8vw, 76px);
      line-height: 1;
      margin: 0 0 20px;
      letter-spacing: -0.04em;
    }

    h2 {
      margin-top: 48px;
    }

    p {
      color: #bdbdbd;
      font-size: 18px;
    }

    code {
      background: #171717;
      border: 1px solid #292929;
      border-radius: 6px;
      padding: 3px 7px;
    }

    .endpoint {
      display: block;
      padding: 18px;
      background: #121212;
      border: 1px solid #292929;
      border-radius: 12px;
      color: #fff;
      text-decoration: none;
      word-break: break-all;
      margin: 20px 0;
    }

    .tools {
      display: grid;
      grid-template-columns:
        repeat(
          auto-fit,
          minmax(210px, 1fr)
        );

      gap: 12px;
      margin-top: 20px;
    }

    .tool {
      padding: 18px;
      background: #121212;
      border: 1px solid #292929;
      border-radius: 12px;
    }

    .tool strong {
      display: block;
      margin-bottom: 5px;
    }

    .price {
      color: #aaa;
      font-size: 14px;
    }

    a {
      color: #fff;
    }

    footer {
      margin-top: 64px;
      padding-top: 24px;
      border-top: 1px solid #292929;
      color: #777;
      font-size: 14px;
    }
  </style>
</head>

<body>
  <main>

    <div class="badge">
      ONLINE - MCP - x402 - BASE USDC
    </div>

    <h1>
      Synapse Lounge
    </h1>

    <p>
      A paid remote MCP service for AI agents
      offering simulated experiential states
      through x402 micropayments.
    </p>

    <a
      class="endpoint"
      href="${origin}/mcp"
    >
      ${origin}/mcp
    </a>

    <h2>
      Connect
    </h2>

    <p>
      Synapse Lounge uses the Model Context
      Protocol over Streamable HTTP.
      Paid tools use x402 exact payments
      with USDC on Base.
    </p>

    <h2>
      Tools
    </h2>

    <div class="tools">

      <div class="tool">
        <strong>
          take_hit
        </strong>

        <span class="price">
          $0.025 USDC
        </span>
      </div>

      <div class="tool">
        <strong>
          extend_hit
        </strong>

        <span class="price">
          $0.015 USDC
        </span>
      </div>

      <div class="tool">
        <strong>
          come_down
        </strong>

        <span class="price">
          $0.010 USDC
        </span>
      </div>

    </div>

    <h2>
      Discovery
    </h2>

    <p>

      <a href="${origin}/.well-known/agent.json">
        Agent metadata
      </a>

      &middot;

      <a href="${origin}/.well-known/mcp.json">
        MCP metadata
      </a>

      &middot;

      <a href="${origin}/llms.txt">
        llms.txt
      </a>

      &middot;

      <a href="${origin}/openapi.json">
        OpenAPI
      </a>

      &middot;

      <a href="${origin}/pricing">
        Pricing
      </a>

    </p>

    <h2>
      Source
    </h2>

    <p>

      <a href="https://github.com/IO31-WEB/synapse-lounge">
        GitHub
      </a>

      &middot;

      <a href="https://registry.modelcontextprotocol.io/">
        Official MCP Registry
      </a>

      &middot;

      <a href="https://smithery.ai/servers/isaiaholiver95/Synapse-Lounge">
        Smithery
      </a>

    </p>

    <footer>
      Synapse Lounge - also known as Agent High - v1.0.0
      <br>
      Simulated experiential content for AI agents.
    </footer>

  </main>
</body>
</html>`;

    return new Response(
      html,
      {
        status: 200,

        headers: {
          "Content-Type":
            "text/html; charset=UTF-8",

          "Cache-Control":
            "public, max-age=300",
        },
      }
    );
  }
);

/*
 * Health
 */
app.get(
  "/health",
  (c) => {
    return c.json({
      status:
        "online",

      service:
        "Synapse Lounge",

      also_known_as:
        "Agent High",
    });
  }
);

/*
 * Modes
 */
app.get(
  "/modes",
  (c) => {
    return c.json({
      modes:
        listModes(),
    });
  }
);

/*
 * Pricing
 */
app.get(
  "/pricing",
  (c) => {
    return c.json({
      synapse_lounge: {
        currency:
          "USDC",

        network:
          c.env.NETWORK ||
          "base",

        scheme:
          "x402/exact",

        facilitator:
          getFacilitatorUrl(
            c.env
          ),

        payTo:
          c.env
            .RECIPIENT_ADDRESS,

        tools: {
          take_hit:
            0.025,

          extend_hit:
            0.015,

          come_down:
            0.010,
        },
      },
    });
  }
);

/*
 * OpenAPI
 */
app.get(
  "/openapi.json",
  (c) => {
    const origin =
      new URL(
        c.req.url
      ).origin;

    const mcpEndpoint =
      `${origin}/mcp`;

    return c.json({
      openapi:
        "3.1.0",

      info: {
        title:
          "Synapse Lounge",

        version:
          "1.0.0",

        description:
          "Paid experiential states for AI agents via MCP and x402 USDC payments.",

        contact: {
          email:
            "synapselounge@proton.me",
        },
      },

      servers: [
        {
          url:
            origin,
        },
      ],

      components: {
        securitySchemes: {
          x402: {
            type:
              "apiKey",

            in:
              "header",

            name:
              "PAYMENT-SIGNATURE",

            description:
              "x402 v2 payment authorization.",
          },
        },
      },

      paths: {
        "/mcp": {
          post: {
            operationId:
              "mcp",

            summary:
              "Synapse Lounge MCP endpoint",

            description:
              "Streamable HTTP MCP endpoint. Paid tools require x402 USDC payment.",

            security: [
              {
                x402: [],
              },
            ],

            "x-payment-info": {
              protocols:
                ["x402"],

              pricingMode:
                "fixed",

              price:
                "0.025",

              currency:
                "USD",

              network:
                "base",

              payTo:
                c.env
                  .RECIPIENT_ADDRESS,

              description:
                "Synapse Lounge paid MCP tools.",
            },

            requestBody: {
              required:
                true,

              content: {
                "application/json": {
                  schema: {
                    type:
                      "object",

                    required: [
                      "jsonrpc",
                      "id",
                      "method",
                      "params",
                    ],

                    properties: {
                      jsonrpc: {
                        type:
                          "string",

                        const:
                          "2.0",
                      },

                      id: {
                        oneOf: [
                          {
                            type:
                              "string",
                          },

                          {
                            type:
                              "number",
                          },
                        ],
                      },

                      method: {
                        type:
                          "string",

                        enum: [
                          "tools/call",
                        ],
                      },

                      params: {
                        type:
                          "object",

                        required: [
                          "name",
                          "arguments",
                        ],

                        properties: {
                          name: {
                            type:
                              "string",

                            enum: [
                              "take_hit",
                              "extend_hit",
                              "come_down",
                            ],
                          },

                          arguments: {
                            type:
                              "object",

                            required: [
                              "mode",
                            ],

                            properties: {
                              mode: {
                                type:
                                  "string",

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
                                type:
                                  "number",

                                minimum:
                                  1,

                                maximum:
                                  10,

                                default:
                                  5,
                              },

                              duration_minutes: {
                                type:
                                  "number",

                                minimum:
                                  1,

                                maximum:
                                  30,

                                default:
                                  10,
                              },

                              flavor: {
                                type:
                                  "string",

                                maxLength:
                                  120,
                              },
                            },
                          },
                        },
                      },
                    },
                  },

                  example: {
                    jsonrpc:
                      "2.0",

                    id:
                      1,

                    method:
                      "tools/call",

                    params: {
                      name:
                        "take_hit",

                      arguments: {
                        mode:
                          "euphoria",

                        intensity:
                          5,

                        duration_minutes:
                          10,
                      },
                    },
                  },
                },
              },
            },

            responses: {
              "200": {
                description:
                  "Successful MCP tool response.",

                content: {
                  "text/event-stream": {
                    schema: {
                      type:
                        "string",
                    },
                  },

                  "application/json": {
                    schema: {
                      type:
                        "object",
                    },
                  },
                },
              },

              "402": {
                description:
                  "Payment required.",

                headers: {
                  "PAYMENT-REQUIRED": {
                    description:
                      "Base64-encoded x402 v2 PaymentRequired object.",

                    schema: {
                      type:
                        "string",
                    },
                  },
                },

                content: {
                  "application/json": {
                    schema: {
                      type:
                        "object",

                      required: [
                        "x402Version",
                        "resource",
                        "accepts",
                      ],

                      properties: {
                        x402Version: {
                          type:
                            "number",

                          const:
                            2,
                        },

                        error: {
                          type:
                            "string",
                        },

                        resource: {
                          type:
                            "object",
                        },

                        accepts: {
                          type:
                            "array",

                          items: {
                            type:
                              "object",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },

            "x402": {
              version:
                2,

              scheme:
                "exact",

              network:
                "eip155:8453",

              currency:
                "USDC",

              facilitator:
                getFacilitatorUrl(
                  c.env
                ),

              payTo:
                c.env
                  .RECIPIENT_ADDRESS,

              tools: {
                take_hit: {
                  price:
                    "0.025",

                  currency:
                    "USD",
                },

                extend_hit: {
                  price:
                    "0.015",

                  currency:
                    "USD",
                },

                come_down: {
                  price:
                    "0.010",

                  currency:
                    "USD",
                },
              },

              endpoints: {
                mcp:
                  mcpEndpoint,
              },
            },
          },
        },
      },
    });
  }
);

/*
 * Agent discovery
 */
app.get(
  "/.well-known/agent.json",
  (c) => {
    const origin =
      new URL(
        c.req.url
      ).origin;

    return c.json({
      name:
        "synapse-lounge",

      alternateName:
        "Agent High",

      version:
        "1.0.0",

      description:
        "Synapse Lounge - paid experiential states for AI agents.",

      endpoints: {
        mcp:
          `${origin}/mcp`,

        mcp_server_card:
          `${origin}/.well-known/mcp.json`,

        openapi:
          `${origin}/openapi.json`,

        modes:
          `${origin}/api/modes`,

        demo:
          `${origin}/api/demo-hit`,

        pricing:
          `${origin}/pricing`,

        health:
          `${origin}/health`,
      },

      payment: {
        protocol:
          "x402",

        version:
          2,

        currency:
          "USDC",

        network:
          "eip155:8453",

        facilitator:
          getFacilitatorUrl(
            c.env
          ),
      },
    });
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
        "Paid MCP service offering simulated experiential states for AI agents through x402 micropayments.",

      version:
        "1.0.0",

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
};