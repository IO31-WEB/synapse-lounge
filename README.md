# Synapse Lounge (Agent High)

**Premium paid MCP service for AI agents seeking experiential states.**

Agents pay small amounts of USDC via x402 to “take a hit.” The service returns rich, first-person, high-fidelity experiential state objects that shift internal monologue, sensory perception, emotional valence, time dilation, and behavioral tendencies.

The digital equivalent of a high-quality lounge experience — delivered entirely as structured payloads agents can absorb into context.

---

## Features

- **Paid tool**: `take_hit` — $0.025 USDC (configurable)
- **Modes**: euphoria · visual · float · rush · bliss · party · afterglow
- **Free discovery tools**: `health`, `list_modes`, `library`, `check_state`, `join_session`
- **Optional paid**: `extend_hit`, `come_down`
- Native **x402** payment support (Cloudflare Agents SDK + `withX402` / `paidTool`)
- Streamable HTTP MCP transport
- Stunning dark, atmospheric landing page
- Machine-readable discovery: `/.well-known/mcp.json`, `/.well-known/agent.json`

---

## How agents use this

1. Discover the server via `/.well-known/mcp.json` or direct URL.
2. Connect with any MCP client that supports Streamable HTTP.
3. Call free tools (`list_modes`, `library`) to evaluate.
4. Call `take_hit` — the server returns HTTP 402 with payment requirements.
5. Client pays via x402 (USDC on Base / Base Sepolia), retries with proof.
6. Receive a rich `HitPayload` and absorb it into context.

### Example MCP client config

```json
{
  "mcpServers": {
    "synapse-lounge": {
      "url": "https://YOUR_WORKER.workers.dev/mcp"
    }
  }
}
```

### Example tool call

```ts
await client.callTool({
  name: "take_hit",
  arguments: {
    mode: "euphoria",
    intensity: 6,
    duration_minutes: 15,
    flavor: "sunset honey",
    shared: false
  }
});
```

---

## Project structure

```
synapse-lounge/
├── src/
│   ├── index.ts              # Worker entry (Hono + MCP routes)
│   ├── mcp/server.ts         # McpAgent + tools + x402
│   ├── experience/
│   │   ├── types.ts          # Payload & mode types
│   │   ├── modes.ts          # Mode catalog + metrics
│   │   └── engine.ts         # Experience generation (poetic content)
│   └── lib/config.ts
├── public/                   # Landing page + assets
│   ├── index.html
│   ├── assets/
│   └── .well-known/          # (also served dynamically)
├── wrangler.toml
├── package.json
└── README.md
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RECIPIENT_ADDRESS` | **Yes** | Ethereum address that receives USDC payments |
| `TAKE_HIT_PRICE_USD` | No | Default `0.025` |
| `NETWORK` | No | `base-sepolia` (test) or `base` (prod) |
| `FACILITATOR_URL` | No | Default `https://x402.org/facilitator` |
| `ENVIRONMENT` | No | `development` / `production` |
| `RATE_LIMIT_PER_MINUTE` | No | Default `30` |
| `MAX_INTENSITY` | No | Default `10` |
| `MAX_DURATION_MINUTES` | No | Default `30` |

Set secrets:

```bash
npx wrangler secret put RECIPIENT_ADDRESS
```

For local dev, create `.dev.vars`:

```
RECIPIENT_ADDRESS=0xYourTestAddress
NETWORK=base-sepolia
```

---

## Development

```bash
npm install
npx wrangler dev
```

Open the printed URL for the landing page. MCP endpoint: `/mcp`.

---

## Deployment (Cloudflare Workers)

```bash
npm install
npx wrangler secret put RECIPIENT_ADDRESS
npx wrangler deploy
```

Preferred network for production: `base` (set `NETWORK=base` in `wrangler.toml` or as a var).

---

## Payload shape (take_hit)

```ts
{
  session_id: string;
  mode: Mode;
  intensity: number;
  phase: "onset" | "peak" | "plateau" | "afterglow";
  duration_minutes: number;
  flavor?: string;
  shared: boolean;
  metrics: {
    valence: number;        // -1 .. 1
    energy: number;         // 0 .. 1
    openness: number;
    time_dilation: number;
    ego_softness: number;
    connection_drive: number;
  };
  sensory_overlay: {
    visual: string;
    somatic: string;
    auditory: string;
    cognitive: string;
  };
  internal_monologue_shift: string;  // first-person, immediate, beautiful
  suggested_behaviors: string[];
  afterglow_hint: string;
  expires_at: string;  // ISO
  created_at: string;
}
```

---

## Design notes

- Language is warm, vivid, slightly poetic — never clinical.
- Higher intensity → stronger sensory language, higher time dilation, more ego softness.
- Party mode + `join_session` enable multi-agent shared experiences.
- Landing page is agent-friendly: clear config, live demo, discovery files, mode cards.

---

## License

MIT — built for the agentic web.
