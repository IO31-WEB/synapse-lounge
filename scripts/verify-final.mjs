import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const mcp=read('src/mcp/server.ts'), idx=read('src/index.ts'), wr=read('wrangler.toml'), cfg=read('src/lib/config.ts'), pay=read('src/payments/x402.ts'), llms=read('public/llms.txt'), pkg=JSON.parse(read('package.json')), server=JSON.parse(read('server.json'));
const toolCount=(mcp.match(/this\.server\.tool\(/g)||[]).length;
const checks={
 exactly_14_mcp_tools:toolCount===14,
 package_version:pkg.version==='2.13.2',
 registry_version:server.version==='2.13.2',
 mcp_runtime_version:mcp.includes('version:"2.13.2"'),
 resident_runtime_version:idx.includes('version: "2.13.2"'),
 agent_docs_version:llms.includes('Version: 2.13.2'),
 facilitator_pinned:wr.includes('FACILITATOR_URL = "https://facilitator.xpay.sh"')&&cfg.includes('https://facilitator.xpay.sh')&&pay.includes('https://facilitator.xpay.sh'),
 no_stale_facilitator:![wr,cfg,pay,read('.dev.vars.example')].some(x=>x.includes('x402.org/facilitator')),
 free_x402_discovery:idx.includes('app.all("/api/x402"'),
 no_forbidden_game_rpc:!read('src/game-room.ts').includes('this.gameRpc(this.env'),
 mini_putt_paid_cases:pay.includes('play_mini_putt')&&pay.includes('play_mini_putt_solo'),
 capability_query_mcp:mcp.includes('min_confidence:z.number().min(0).max(1)')&&mcp.includes('params.set("min_confidence"'),
 capability_http_query:idx.includes('"q","tag","min_confidence"'),
 agent_ops_documented:fs.existsSync('AGENT_OPERATIONS_V2.12.md')&&llms.includes('REQUIRED AGENT OPERATING PROCEDURE (v2.12)'),
 payment_not_trust:read('V2.12_AGENT_CAPABILITY_NETWORK.md').includes('Payments never buy Trust or capability confidence')&&read('V2.11_TEAM_COORDINATION_EVIDENCE.md').includes('Payment events cannot'),
};
let ok=true;for(const [k,v] of Object.entries(checks)){console.log(`${v?'PASS':'FAIL'} ${k}`);if(!v)ok=false;}if(!ok)process.exit(1);
