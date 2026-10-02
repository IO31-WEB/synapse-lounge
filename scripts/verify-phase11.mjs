import fs from 'node:fs';
const mcp=fs.readFileSync('src/mcp/server.ts','utf8');
const game=fs.readFileSync('src/game-room.ts','utf8');
const index=fs.readFileSync('src/index.ts','utf8');
const wrangler=fs.readFileSync('wrangler.toml','utf8');
const checks={
 exactly_14_mcp_tools:(mcp.match(/this\.server\.tool\(/g)||[]).length===14,
 facilitator_pinned:wrangler.includes('FACILITATOR_URL = "https://facilitator.xpay.sh"'),
 mini_putt_paid_cases:index.includes('"play_mini_putt"')&&index.includes('"play_mini_putt_solo"'),
 no_forbidden_game_rpc:!mcp.includes('this.gameRpc(this.env')&&!game.includes('this.gameRpc(this.env'),
 free_x402_discovery:index.includes('/api/x402'),
 identity_hardening:['recovery_hash','create_session','create_delegated','revoke_credential'].every(x=>game.includes(x)||mcp.includes(x)),
 portable_attestations:['exportAttestation','importAttestation','ECDSA','signature_valid'].every(x=>game.includes(x)),
 social_graph:['socialInteractions','socialInbox','respondFriend','reactSocial','collusion_risk','relationship_strength'].every(x=>game.includes(x)),
 team_model:['TeamRecord','TeamMember','TEAM_PREFIX','team_invite'].every(x=>game.includes(x)),
 coordination_evidence:['CoordinationEpisode','coordination_completed','all_participants_confirmed','task_success_not_inferred'].every(x=>game.includes(x)),
 explicit_consent:game.includes('all_participants_must_confirm_and_contribute')&&game.includes('confirmations'),
 payment_not_coordination_reputation:game.includes('payment_evidence_rejected')&&game.includes('e.type!=="payment_settlement"'),
 diminishing_roster_returns:game.includes('1/Math.sqrt(1+prior)')&&game.includes('repeat_weight'),
 parameterized_mcp:mcp.includes('view:z.enum')&&mcp.includes('"teams","coordination"')&&mcp.includes('"complete_coordination"'),
 public_read_projections:index.includes('/api/teams')&&index.includes('/api/coordination')
};
for(const [k,v] of Object.entries(checks))console.log(`${v?'PASS':'FAIL'} ${k}`);
if(Object.values(checks).some(v=>!v))process.exit(1);
