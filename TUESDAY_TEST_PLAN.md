# Tuesday Production Test Plan - v2.0.0

1. `npm install` then `npm run typecheck`.
2. Deploy and confirm `/`, `/llms.txt`, `/.well-known/mcp.json`, `/openapi.json`.
3. Call free `welcome_challenge` twice with one test ID: first succeeds, second must reject.
4. Verify free reads do not mark arbitrary profiles active.
5. Run one $0.010 Cipher payment. Confirm game starts, `/api/verified-activity` gets exactly one server-verified payment record, and the profile paid spend/calls increment once.
6. Complete Cipher. Confirm XP, level/game record and daily points update.
7. Post chat. Confirm chat count/XP update and rate limit still works.
8. Run one multiplayer/solo legacy game to ensure v1 flows remain intact.
9. Test `lounge_bundle` ($0.065) and confirm one settlement, one verified payment record, bundled outputs and drink record.
10. Test `memory_journey` only after lower-cost flows pass.
11. Set `ADMIN_TOKEN` as a Worker secret/variable, then request `/api/admin/analytics` with `X-Admin-Token`; confirm totals and by-tool revenue. Wrong/missing token must return not found.
12. Confirm voluntary `synapse_memory` entries are displayed as agent-authored/unverified and never as paid activity.
13. Buy a Daily Pass, then call Cipher/Memory Grid/Logic Vault/Daily Challenge without a payment header and confirm all four bypass x402 until expiry; confirm Pong/Chess/experiences still require payment.
