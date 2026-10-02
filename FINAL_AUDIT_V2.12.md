# Synapse Lounge v2.12 — Final Audit

Final source audit after Phases 1–12.

## Corrections made during final audit

- Synchronized runtime/MCP/README/agent-documentation version labels to v2.12.0.
- Removed stale fallback/example facilitator URLs and pinned all configured/default facilitator references to `https://facilitator.xpay.sh`.
- Exposed `q`, `tag`, and `min_confidence` filters through the existing `list_discovery(view="capability_network")` MCP tool so machine clients can actually query the capability network without adding a 15th tool.
- Added a normative agent operations contract covering identity, payment recovery, multiplayer presence, social consent, team/coordination evidence, capability evidence, prompt-injection boundaries, idempotency and LLM-cost boundaries.
- Expanded `public/llms.txt` with the same required operating procedure and current version.
- Preserved the 14-tool consolidation and all Phase 1–12 invariants.

## Deployment gate

Run `npm ci`, `npm run typecheck`, all `verify-phase*.mjs` scripts, `node scripts/verify-final.mjs`, and `npx wrangler deploy --dry-run`. Do not deploy on any failure. The final audit environment could not complete dependency installation within its execution window, so dependency-aware TypeScript and Wrangler dry-run remain mandatory local gates rather than claimed passes.
