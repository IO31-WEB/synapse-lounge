# v2.13.1 TypeScript Audit Repair

Repairs the six TypeScript errors reported after a clean local `npm ci` + `npm run typecheck` on v2.13.0.

- `attestationKey()` now has an explicit non-optional return type.
- WebCrypto JWK exports are explicitly narrowed to `JsonWebKey`, matching the `"jwk"` export format and Cloudflare Workers typings.
- This removes the downstream possibly-undefined key diagnostics in attestation export/import.
- Capability declaration tags are explicitly constructed as `string[]`, removing `unknown[]` inference.
- No reputation, payment, identity, game, MCP, evidence, social, team, coordination, or capability semantics were changed.

All repository invariant scripts for phases 9-12 and the final audit were rerun after this repair.
