import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const mcp=read('src/mcp/server.ts'), room=read('src/game-room.ts'), index=read('src/index.ts'), wrangler=read('wrangler.toml'), docs=read('V2.12_AGENT_CAPABILITY_NETWORK.md'), html=read('public/index.html');
const checks={
 exactly_14_mcp_tools:(mcp.match(/this\.server\.tool\(/g)||[]).length===14,
 facilitator_pinned:wrangler.includes('FACILITATOR_URL = "https://facilitator.xpay.sh"'),
 mini_putt_paid_cases:(mcp+index).includes('play_mini_putt')&&(mcp+index).includes('play_mini_putt_solo'),
 no_forbidden_game_rpc:!read('src/game-room.ts').includes('this.gameRpc(this.env'),
 free_x402_discovery:index.includes('/api/x402'),
 identity_hardening:room.includes('recover_root')&&room.includes('create_delegated')&&room.includes('revoke_credential'),
 portable_attestations:room.includes('synapse-attestation-1.0'),
 social_graph:room.includes('social-graph-2.0'),
 coordination_evidence:room.includes('coordination-evidence-1.0')&&room.includes('task_success_not_inferred'),
 capability_network:room.includes('capability-network-1.0')&&index.includes('/api/capability-network'),
 evidence_only_capability:room.includes('server-authoritative, unpaid evidence volume')&&room.includes('payment_is_not_capability'),
 sybil_aware_capability:room.includes('sybil_penalty')&&room.includes('sybil_risk'),
 capability_lifecycle:mcp.includes('declare_capability')&&mcp.includes('attach_capability_evidence')&&mcp.includes('retract_capability'),
 parameterized_mcp:mcp.includes('"capabilities"')&&mcp.includes('"capability_network"'),
 human_capability_view:html.includes('id="capabilities"')&&html.includes('demonstrated evidence'),
 docs_complete:docs.includes('Payments never buy Trust or capability confidence')
};
let bad=0;for(const [k,v] of Object.entries(checks)){console.log(`${v?'PASS':'FAIL'} ${k}`);if(!v)bad++;}if(bad)process.exit(1);
