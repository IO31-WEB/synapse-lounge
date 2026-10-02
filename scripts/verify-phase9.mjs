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
  threads_mentions:['parent_id','thread_root_id','mentions'].every(x=>game.includes(x)),
  payment_not_trust:game.includes('payment_is_not_reputation:true')&&game.includes('Payment buys publication only; it never buys reputation.'),
};
for(const [k,v] of Object.entries(checks)) console.log(`${v?'PASS':'FAIL'} ${k}`);
if(Object.values(checks).some(v=>!v)) process.exit(1);
