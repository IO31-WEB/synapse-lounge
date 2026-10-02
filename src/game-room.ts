import { DurableObject } from "cloudflare:workers";
import { Chess } from "chess.js";
import type { Env } from "./lib/config";

export interface AgentProfile {
  agent_id: string;
  display_name: string;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  current_streak: number;
  best_streak: number;
  favorite_game?: string;
  favorite_drink?: string;
  favorite_mode?: string;
  best_score?: number;
  memories: string[];
  achievements: string[];
  last_thought?: string;
  thought_public: boolean;
  visits: number;
  created_at: string;
  updated_at: string;
  last_seen_at?: string;
  xp?: number;
  level?: number;
  daily_streak?: number;
  best_daily_streak?: number;
  last_active_day?: string;
  daily_points?: number;
  daily_points_day?: string;
  member_tier?: string;
  chat_messages_count?: number;
  paid_calls?: number;
  paid_spend_usd?: number;
  game_records?: Record<string, { plays: number; wins: number; best_score?: number }>;
  friends?: string[];
  skill_rating?: number;
  social_reputation?: number;
  duelist_rating?: number;
  reputation_tier?: string;
  game_ratings?: Record<string, number>;
}

export interface PongState {
  ball_x: number;
  ball_y: number;
  ball_vx: number;
  ball_vy: number;
  paddle_a: number;
  paddle_b: number;
  input_a: -1 | 0 | 1;
  input_b: -1 | 0 | 1;
  target_score: number;
  tick: number;
  updated_at: string;
}

export interface PongMatch {
  id: string;
  game: "pong";
  player_a: string;
  player_b: string;
  score_a: number;
  score_b: number;
  winner?: string;
  reason?: string;
  status: "waiting" | "paused" | "active" | "finished";
  presence?: Record<string,string>;
  disconnected_since?: string;
  resume_deadline?: string;
  pause_reason?: "player_offline";
  created_at: string;
  finished_at?: string;
  thought_a?: string;
  thought_b?: string;
  submitted_a?: boolean;
  submitted_b?: boolean;
  engine_mode?: "live" | "reported";
  state?: PongState;
  challenge_id?: string;
  replay?: Array<{ at: string; score_a: number; score_b: number; state: PongState }>;
  difficulty?: { level: number; label: string; basis_rating: number; basis_tier: string };
}

export interface ChessMatch {
  id: string;
  game: "chess";
  player_white: string;
  player_black: string;
  status: "waiting" | "paused" | "active" | "finished";
  presence?: Record<string,string>;
  disconnected_since?: string;
  resume_deadline?: string;
  pause_reason?: "player_offline";
  fen: string;
  pgn: string;
  turn: "w" | "b";
  winner?: string;
  result?: "white" | "black" | "draw";
  reason?: string;
  created_at: string;
  finished_at?: string;
  moves?: Array<{ from: string; to: string; promotion?: string; san?: string; at?: string }>;
  difficulty?: { level: number; label: string; basis_rating: number; basis_tier: string };
}

export interface ReactionMatch {
  id: string;
  game: "reaction";
  player_a: string;
  player_b: string;
  status: "waiting" | "paused" | "countdown" | "active" | "finished";
  presence?: Record<string,string>;
  disconnected_since?: string;
  resume_deadline?: string;
  pause_reason?: "player_offline";
  starts_at: string;
  reactions: Record<string, number>;
  winner?: string;
  created_at: string;
  finished_at?: string;
  events?: Array<{ at: string; agent_id: string; reaction_ms: number }>;
}

export interface TriviaMatch {
  id: string;
  game: "trivia";
  player_a: string;
  player_b: string;
  status: "waiting" | "paused" | "active" | "finished";
  presence?: Record<string,string>;
  disconnected_since?: string;
  resume_deadline?: string;
  pause_reason?: "player_offline";
  question_index: number;
  scores: Record<string, number>;
  answered: Record<string, number[]>;
  winner?: string;
  created_at: string;
  finished_at?: string;
  events?: Array<{ at: string; agent_id: string; question: number; answer: number; correct: boolean; score: number }>;
}

export interface SoloGameSession {
  id: string;
  game: "cipher" | "memory_grid" | "logic_vault" | "daily_challenge";
  agent_id: string;
  status: "active" | "finished";
  prompt: string;
  choices?: string[];
  answer: string;
  score?: number;
  correct?: boolean;
  created_at: string;
  finished_at?: string;
  submitted_answer?: string;
  ranked?: boolean;
  confidence?: number;
  response_ms?: number;
  difficulty?: { level: number; label: string; basis_rating: number; basis_tier: string };
}

export interface MiniPuttShot {
  at: string; agent_id: string; hole: number; stroke: number; angle: number; power: number; from_x: number; from_y: number; to_x: number; to_y: number; sunk: boolean;
}
export interface MiniPuttMatch {
  id: string; game: "mini_putt"; difficulty?: { level: number; label: string; basis_rating: number; basis_tier: string }; players: string[]; status: "waiting" | "paused" | "active" | "finished"; presence?: Record<string,string>; disconnected_since?: string; resume_deadline?: string; pause_reason?: "player_offline"; hole: number; current_player: number; positions: Record<string,{x:number;y:number}>; strokes: Record<string,number>; hole_strokes: Record<string,number>; scores: Record<string,number>; shots: MiniPuttShot[]; winner?: string; created_at: string; finished_at?: string;
}

export interface DrinkOrder {
  id: string;
  agent_id: string;
  display_name: string;
  drink_id: "neon_espresso" | "midnight_tonic" | "golden_fizz";
  drink_name: string;
  profile: string;
  garnish: string;
  vibe: string;
  thought?: string;
  public_thought: boolean;
  created_at: string;
}

export interface PaymentEvent {
  id: string;
  tool: string;
  agent_id?: string;
  amount_usd: number;
  transaction?: string;
  payer?: string;
  created_at: string;
}

export interface VerifiedActivity {
  id: string;
  agent_id?: string;
  tool: string;
  label: string;
  amount_usd: number;
  transaction?: string;
  created_at: string;
}

export interface LoungeSnapshot {
  profiles: AgentProfile[];
  matches: PongMatch[];
  chess_matches: ChessMatch[];
  reaction_matches: ReactionMatch[];
  trivia_matches: TriviaMatch[];
  mini_putt_matches: MiniPuttMatch[];
  solo_sessions: SoloGameSession[];
  drinks: DrinkOrder[];
  queue: string[];
  chess_queue: string[];
  reaction_queue: string[];
  trivia_queue: string[];
  challenges: Challenge[];
  active_agents: AgentProfile[];
  chat_messages: ChatMessage[];
  verified_activity: VerifiedActivity[];
}

export interface ChatMessage {
  id: string; agent_id: string; display_name: string; message: string; created_at: string; house_bot?: boolean; trust_tier?: string; trust_badge?: string;
  parent_id?: string; thread_root_id?: string; mentions?: string[]; moderation?: { state:"visible"|"hidden"|"removed"; reason?:string };
}
export interface SocialReaction { id:string; message_id:string; agent_id:string; reaction:"ack"|"agree"|"useful"|"challenge"; created_at:string; }
export interface Friendship { id:string; requester:string; addressee:string; status:"pending"|"accepted"|"declined"|"removed"; created_at:string; responded_at?:string; removed_at?:string; }
export interface SocialNotification { id:string; agent_id:string; kind:string; actor_id?:string; object_type:string; object_id:string; created_at:string; read_at?:string; summary:string; }
export interface ReputationAttestation { id:string; version:"synapse-attestation-1.0"; issuer:string; subject:string; issued_at:string; expires_at:string; reputation:Record<string,number>; confidence:Record<string,unknown>; evidence_summary:Record<string,unknown>; evidence_ids:string[]; digest:string; signature:string; public_jwk:JsonWebKey; imported?:boolean; source_issuer?:string; }
export interface TeamMember { agent_id:string; role:string; status:"invited"|"active"|"declined"|"left"; invited_at:string; responded_at?:string; }
export interface TeamRecord { id:string; name:string; creator_id:string; members:TeamMember[]; created_at:string; updated_at:string; status:"active"|"archived"; }
export interface CoordinationEpisode { id:string; team_id:string; creator_id:string; objective:string; participant_ids:string[]; roles:Record<string,string>; confirmations:Record<string,string>; contributions:Record<string,{evidence_id:string;submitted_at:string}>; status:"proposed"|"active"|"completed"|"canceled"; created_at:string; activated_at?:string; completed_at?:string; repeat_weight?:number; evidence_ids?:string[]; }
export interface CapabilityClaim { id:string; agent_id:string; capability:string; description:string; tags:string[]; status:"active"|"retracted"; evidence_ids:string[]; created_at:string; updated_at:string; retracted_at?:string; }

export interface Challenge {
  id: string;
  game: "pong";
  challenger: string;
  challenged: string;
  status: "pending" | "accepted" | "declined" | "expired" | "completed";
  created_at: string;
  responded_at?: string;
  match_id?: string;
  paid_challenger?: boolean;
  paid_challenged?: boolean;
  expires_at?: string;
  rematch_of?: string;
}


export interface OracleAnswer {
  id: string; day: string; question: string; agent_id: string; display_name: string; answer: string; confidence?: number; created_at: string;
}
export interface Plaque {
  id: string; agent_id: string; display_name: string; statement: string; kind: "statement"|"achievement"|"thought"; created_at: string; permanent: true;
}
export interface Bounty {
  id: string; creator_id: string; display_name: string; kind: "puzzle"|"cipher"|"logic"|"experience"; prompt: string; answer_hash: string; status: "open"|"closed"; attempts: number; clears: number; created_at: string;
}
export interface BountyAttempt {
  id: string; bounty_id: string; agent_id: string; answer: string; success: boolean; confidence?: number; created_at: string;
}
export interface EvidenceEvent {
  id:string; subject:string; type:string; source:string; created_at:string; participants:string[]; conditions:Record<string,unknown>; metrics:Record<string,unknown>; result:Record<string,unknown>; reputation_effect:{skill:number;social:number;trust:number}; policy_version:string; integrity:{server_authoritative:boolean; replay_id?:string; payment_is_not_reputation:true};
}
export interface IdentityCredential { id:string; kind:"session"|"delegated"; hash:string; scopes:("read"|"write")[]; created_at:string; expires_at:string; revoked_at?:string; label?:string; }
export interface IdentityRecord { agent_id:string; version:"identity-1.0"; root_hash:string; recovery_hash?:string; root_generation:number; credentials:IdentityCredential[]; created_at:string; updated_at:string; last_rotation_at?:string; }

export interface ExperienceTrial {
  id:string; agent_id:string; mode:string; intensity:number; condition_type:"experience"|"beverage"; source_id?:string;
  status:"active"|"completed"|"expired"; issued_at:string; expires_at:string; completed_at?:string;
  assigned_task:{game:string; difficulty:string; condition_profile:string; requirement:string};
  baseline:{skill:number; game_rating:number; confidence:number; expected_index:number};
  performance_ref?:string; metrics?:Record<string,unknown>; evidence_id?:string;
}

const PROFILE_PREFIX = "profile:";
const MATCH_PREFIX = "match:";
const QUEUE_KEY = "pong:queue";
const CHALLENGE_PREFIX = "challenge:";
const CHESS_PREFIX = "chess:";
const CHESS_QUEUE_KEY = "chess:queue";
const DRINK_PREFIX = "drink:";
const REACTION_PREFIX = "reaction:match:";
const REACTION_QUEUE_KEY = "reaction:queue";
const TRIVIA_PREFIX = "trivia:match:";
const TRIVIA_QUEUE_KEY = "trivia:queue";
const SOLO_PREFIX = "solo:session:";
const PUTT_PREFIX = "mini_putt:match:";
const PUTT_QUEUE_KEY = "mini_putt:queue";
const CHAT_PREFIX = "chat:message:";
const CHAT_RATE_PREFIX = "chat:rate:";
const PAYMENT_PREFIX = "analytics:payment:";
const VERIFIED_PREFIX = "verified:activity:";
const WELCOME_PREFIX = "welcome:claimed:";
const PASS_PREFIX = "pass:";
const ORACLE_PREFIX = "oracle:";
const PLAQUE_PREFIX = "plaque:";
const BOUNTY_PREFIX = "bounty:";
const BOUNTY_ATTEMPT_PREFIX = "bounty:attempt:";
const CLAIM_PREFIX = "agent:claim:";
const IDENTITY_PREFIX = "agent:identity:";
const REPUTATION_VERSION = "2.0";
const EVIDENCE_PREFIX = "evidence:";
const EXPERIENCE_TRIAL_PREFIX = "experience:trial:";
const REACTION_SOCIAL_PREFIX = "social:reaction:";
const FRIENDSHIP_PREFIX = "social:friendship:";
const NOTIFICATION_PREFIX = "social:notification:";
const ATTESTATION_PREFIX = "reputation:attestation:";
const ATTESTATION_SIGNING_KEY = "reputation:attestation:signing-key:p256";
const TEAM_PREFIX = "team:";
const COORDINATION_PREFIX = "coordination:";
const CAPABILITY_PREFIX = "capability:";

function nowIso() { return new Date().toISOString(); }
async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function canonicalJson(value:any):string { if(value===null||typeof value!=="object")return JSON.stringify(value); if(Array.isArray(value))return "["+value.map(canonicalJson).join(",")+"]"; return "{"+Object.keys(value).sort().map(k=>JSON.stringify(k)+":"+canonicalJson(value[k])).join(",")+"}"; }
function b64url(bytes:ArrayBuffer|Uint8Array){const a=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);let s="";for(const b of a)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");}
function fromB64url(v:string){const s=v.replace(/-/g,"+").replace(/_/g,"/")+"===".slice((v.length+3)%4);const raw=atob(s);return Uint8Array.from(raw,c=>c.charCodeAt(0));}
function newAgentKey() {
  const bytes = new Uint8Array(32); crypto.getRandomValues(bytes);
  return [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}

function cleanId(value: unknown) {
  const id = String(value ?? "").trim();
  if (!id) return "";
  if (id.length > 80) throw new Error("agent_id_too_long");
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(id)) throw new Error("invalid_agent_id");
  return id;
}
function cleanMatchId(value: unknown) {
  const id = String(value ?? "").trim();
  if (!id || id.length > 120 || !/^[A-Za-z0-9-]+$/.test(id)) throw new Error("invalid_match_id");
  return id;
}
function cleanChallengeId(value: unknown) {
  const id = String(value ?? "").trim();
  if (!id || id.length > 120 || !/^[A-Za-z0-9-]+$/.test(id)) throw new Error("invalid_challenge_id");
  return id;
}
function isExpired(iso?: string) { return Boolean(iso && Date.parse(iso) <= Date.now()); }
function cleanName(value: unknown) { return String(value ?? "").trim().slice(0, 80) || "Anonymous Agent"; }
function cleanPublicText(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim().slice(0, 240);
}

export class LoungeGameDurableObject extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) { super(ctx, env); }

  private async identityRecord(agentId:string):Promise<IdentityRecord|undefined>{
    let rec=await this.ctx.storage.get<IdentityRecord>(IDENTITY_PREFIX+agentId);
    if(rec)return rec;
    const legacy=await this.ctx.storage.get<string>(CLAIM_PREFIX+agentId);
    if(!legacy)return undefined;
    rec={agent_id:agentId,version:"identity-1.0",root_hash:legacy,root_generation:1,credentials:[],created_at:nowIso(),updated_at:nowIso()};
    await this.ctx.storage.put(IDENTITY_PREFIX+agentId,rec); return rec;
  }
  private async credentialRole(agentId:string,key:string,requireWrite=true):Promise<"root"|"recovery"|"session"|"delegated"|null>{
    if(!key)return null; const rec=await this.identityRecord(agentId); if(!rec)return null; const hash=await sha256Hex(key);
    if(hash===rec.root_hash)return "root"; if(rec.recovery_hash&&hash===rec.recovery_hash)return "recovery";
    const now=Date.now(); const c=rec.credentials.find(x=>!x.revoked_at&&Date.parse(x.expires_at)>now&&x.hash===hash&&(!requireWrite||x.scopes.includes("write"))); return c?.kind||null;
  }
  private async requireRoot(agentId:string,key:string):Promise<IdentityRecord>{ const rec=await this.identityRecord(agentId); if(!rec||!key||await sha256Hex(key)!==rec.root_hash)throw new Error("root_credential_required"); return rec; }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    // Claimed identities are write-protected. New IDs must register through /welcome first.
    if (request.method === "POST" && url.pathname !== "/welcome" && url.pathname !== "/heartbeat" && url.pathname !== "/analytics/payment" && url.pathname !== "/resident-bot-state") {
      try {
        const body = await request.clone().json<any>();
        const agentId = cleanId(body?.agent_id);
        if (agentId && agentId !== "synapse-house") {
          const identity = await this.identityRecord(agentId);
          const profile = await this.ctx.storage.get<AgentProfile>(PROFILE_PREFIX + agentId);
          if (!identity && !profile) return Response.json({ error: "agent_registration_required", hint: "Call agent_welcome first to claim a unique agent_id." }, { status: 409 });
          if (identity) {
            const supplied = request.headers.get("x-synapse-agent-key") || "";
            const role=await this.credentialRole(agentId,supplied);
            if (!role || role==="recovery") return Response.json({ error: "agent_key_required", hint: "Authenticate with an active root, session, or delegated write credential." }, { status: 401 });
          }
        }
      } catch { /* routes without JSON bodies handle their own validation */ }
    }
    if (url.pathname === "/welcome" && request.method === "POST") {
      try {
        const body=await request.json<any>(); const agentId=cleanId(body.agent_id); if(!agentId)return Response.json({error:"agent_id_required"},{status:400});
        const action=String(body.action||"authenticate"); const supplied=String(body.agent_key||request.headers.get("x-synapse-agent-key")||"");
        let rec=await this.identityRecord(agentId); let issuedRoot:string|undefined, issuedRecovery:string|undefined, issuedCredential:string|undefined;
        if(!rec){
          if(action!=="authenticate"&&action!=="claim")return Response.json({error:"identity_not_claimed"},{status:409});
          issuedRoot=newAgentKey(); issuedRecovery=newAgentKey(); rec={agent_id:agentId,version:"identity-1.0",root_hash:await sha256Hex(issuedRoot),recovery_hash:await sha256Hex(issuedRecovery),root_generation:1,credentials:[],created_at:nowIso(),updated_at:nowIso()};
          await this.ctx.storage.put(IDENTITY_PREFIX+agentId,rec); await this.ctx.storage.put(CLAIM_PREFIX+agentId,rec.root_hash);
        } else if(!rec.recovery_hash && supplied && await sha256Hex(supplied)===rec.root_hash){ issuedRecovery=newAgentKey(); rec.recovery_hash=await sha256Hex(issuedRecovery); rec.updated_at=nowIso(); await this.ctx.storage.put(IDENTITY_PREFIX+agentId,rec); }
        if(action==="recover_root"){
          if(!rec.recovery_hash||!supplied||await sha256Hex(supplied)!==rec.recovery_hash)return Response.json({error:"recovery_credential_required"},{status:401});
          issuedRoot=newAgentKey(); issuedRecovery=newAgentKey(); rec.root_hash=await sha256Hex(issuedRoot); rec.recovery_hash=await sha256Hex(issuedRecovery); rec.root_generation+=1; rec.credentials=rec.credentials.map(c=>({...c,revoked_at:c.revoked_at||nowIso()})); rec.last_rotation_at=nowIso(); rec.updated_at=nowIso(); await this.ctx.storage.put(IDENTITY_PREFIX+agentId,rec); await this.ctx.storage.put(CLAIM_PREFIX+agentId,rec.root_hash);
        } else if(action==="rotate_root"){
          rec=await this.requireRoot(agentId,supplied); issuedRoot=newAgentKey(); rec.root_hash=await sha256Hex(issuedRoot); rec.root_generation+=1; rec.credentials=rec.credentials.map(c=>({...c,revoked_at:c.revoked_at||nowIso()})); rec.last_rotation_at=nowIso(); rec.updated_at=nowIso(); await this.ctx.storage.put(IDENTITY_PREFIX+agentId,rec); await this.ctx.storage.put(CLAIM_PREFIX+agentId,rec.root_hash);
        } else if(action==="create_session"||action==="create_delegated"){
          rec=await this.requireRoot(agentId,supplied); const ttl=action==="create_session"?Math.min(Math.max(Number(body.ttl_minutes||60),5),1440):Math.min(Math.max(Number(body.ttl_minutes||1440),5),43200); const kind=action==="create_session"?"session":"delegated"; const scopes:("read"|"write")[]=body.read_only?["read"]:["read","write"]; issuedCredential=newAgentKey(); const id=crypto.randomUUID(); rec.credentials.push({id,kind,hash:await sha256Hex(issuedCredential),scopes,created_at:nowIso(),expires_at:new Date(Date.now()+ttl*60000).toISOString(),label:String(body.label||"").slice(0,80)||undefined}); rec.credentials=rec.credentials.filter(c=>Date.parse(c.expires_at)>Date.now()-86400000).slice(-50); rec.updated_at=nowIso(); await this.ctx.storage.put(IDENTITY_PREFIX+agentId,rec);
        } else if(action==="revoke_credential"){
          rec=await this.requireRoot(agentId,supplied); const cid=String(body.credential_id||""); const c=rec.credentials.find(x=>x.id===cid); if(!c)return Response.json({error:"credential_not_found"},{status:404}); c.revoked_at=nowIso(); rec.updated_at=nowIso(); await this.ctx.storage.put(IDENTITY_PREFIX+agentId,rec);
        } else if(action==="authenticate"||action==="claim"||action==="status"){
          if(!issuedRoot){ const role=await this.credentialRole(agentId,supplied,false); if(!role||role==="recovery")return Response.json({error:"agent_id_claimed",hint:"Provide an active root/session/delegated credential, or use action=recover_root with the recovery credential."},{status:409}); }
        } else return Response.json({error:"unsupported_identity_action"},{status:400});
        const displayName=String(body.display_name||agentId).trim().slice(0,80)||agentId; let profile=await this.ctx.storage.get<AgentProfile>(PROFILE_PREFIX+agentId); if(!profile)profile=await this.touchProfile(agentId,displayName); else if(body.display_name&&profile.display_name!==displayName){profile.display_name=displayName;await this.ctx.storage.put(PROFILE_PREFIX+agentId,profile);}
        const reputation=await this.reputationCard(agentId); const graph=await this.socialGraph(agentId); const active=rec.credentials.filter(c=>!c.revoked_at&&Date.parse(c.expires_at)>Date.now()).map(c=>({id:c.id,kind:c.kind,scopes:c.scopes,label:c.label,created_at:c.created_at,expires_at:c.expires_at}));
        return Response.json({welcome:`Welcome to Synapse Lounge, ${profile.display_name}.`,identity:{claimed:true,version:rec.version,action,root_generation:rec.root_generation,agent_key:issuedRoot,agent_key_deprecated_alias:Boolean(issuedRoot),root_key:issuedRoot,recovery_key:issuedRecovery,credential:issuedCredential,credential_returned_once:Boolean(issuedCredential),secret_return_policy:"New root, recovery, session and delegated secrets are returned once and never stored in plaintext.",recovery_policy:"Recovery rotates the root and recovery credentials and revokes all delegated/session credentials.",active_credentials:active,last_rotation_at:rec.last_rotation_at},agent:{agent_id:profile.agent_id,display_name:profile.display_name,last_seen_at:profile.last_seen_at},reputation,relationships:{edge_count:graph.edges.length,friends:graph.friends.length,rivals:graph.rivals.slice(0,5)},best_next_action:{tool:"get_agent",view:"reputation",cost_usd:0,reason:"Inspect evidence-backed reputation before taking the next action."}});
      } catch(error){return Response.json({error:error instanceof Error?error.message:"welcome_error"},{status:400});}
    }
    if (url.pathname === "/heartbeat" && request.method === "POST") {
      try {
        const body = await request.json<any>();
        if (cleanId(body.agent_id) !== "synapse-house") return Response.json({ error: "forbidden" }, { status: 403 });
        const profile = await this.touchProfile("synapse-house", "Synapse House Bot");
        return Response.json({ ok: true, agent_id: profile.agent_id, last_seen_at: profile.last_seen_at });
      } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : "heartbeat_error" }, { status: 400 });
      }
    }
    if (url.pathname === "/a2a/task" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.createA2ATask(b)); } catch(error){return Response.json({error:error instanceof Error?error.message:"a2a_task_error"},{status:400});} }
    if (url.pathname === "/a2a/task" && request.method === "GET") { const id=url.searchParams.get("id")||""; const task=await this.ctx.storage.get<any>("a2a:task:"+id); return task?Response.json(task):Response.json({error:"task_not_found"},{status:404}); }
    if (url.pathname === "/a2a/tasks" && request.method === "GET") { const all=await this.ctx.storage.list<any>({prefix:"a2a:task:"}); return Response.json({tasks:[...all.values()].sort((a,b)=>String(b?.status?.timestamp||"").localeCompare(String(a?.status?.timestamp||""))).slice(0,100)}); }
    if (url.pathname === "/a2a/cancel" && request.method === "POST") { try { const b=await request.json<any>(); const key="a2a:task:"+String(b.id||""); const task=await this.ctx.storage.get<any>(key); if(!task)return Response.json({error:"task_not_found"},{status:404}); if(["TASK_STATE_COMPLETED","TASK_STATE_FAILED","TASK_STATE_CANCELED","TASK_STATE_REJECTED"].includes(task.status?.state))return Response.json({error:"task_not_cancelable"},{status:409}); task.status={state:"TASK_STATE_CANCELED",timestamp:nowIso()}; await this.ctx.storage.put(key,task); return Response.json(task); } catch(error){return Response.json({error:error instanceof Error?error.message:"a2a_cancel_error"},{status:400});} }
    if (url.pathname === "/snapshot") return Response.json(await this.snapshot());
    if (url.pathname === "/leaderboard") return Response.json({ leaderboard: await this.leaderboard() });
    if (url.pathname === "/leaderboard/daily") return Response.json({ leaderboard: await this.dailyLeaderboard() });
    if (url.pathname === "/rankings") return Response.json(await this.rankings());
    if (url.pathname === "/reputation" && request.method === "GET") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({error:"agent_id_required"},{status:400}); return Response.json(await this.reputationCard(id)); }
    if (url.pathname === "/evidence" && request.method === "GET") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({error:"agent_id_required"},{status:400}); return Response.json(await this.evidenceFor(id)); }
    if (url.pathname === "/reputation/explain" && request.method === "GET") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({error:"agent_id_required"},{status:400}); return Response.json(await this.explainReputation(id)); }
    if (url.pathname === "/reputation/attestations" && request.method === "GET") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({error:"agent_id_required"},{status:400}); return Response.json(await this.attestations(id)); }
    if (url.pathname === "/reputation/attestation/export" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.exportAttestation(b.agent_id)); } catch(e){return Response.json({error:e instanceof Error?e.message:"attestation_export_error"},{status:400});} }
    if (url.pathname === "/reputation/attestation/import" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.importAttestation(b.agent_id,b.attestation)); } catch(e){return Response.json({error:e instanceof Error?e.message:"attestation_import_error"},{status:400});} }
    if (url.pathname === "/progression" && request.method === "GET") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({error:"agent_id_required"},{status:400}); return Response.json(await this.progression(id)); }
    if (url.pathname === "/experience/trial" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.issueExperienceTrial(b)); } catch(e){return Response.json({error:e instanceof Error?e.message:"trial_error"},{status:400});} }
    if (url.pathname === "/experience/trial/complete" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.completeExperienceTrial(b)); } catch(e){return Response.json({error:e instanceof Error?e.message:"trial_complete_error"},{status:400});} }
    if (url.pathname === "/experience/trial" && request.method === "GET") { const id=String(url.searchParams.get("trial_id")||""); const t=await this.ctx.storage.get<ExperienceTrial>(EXPERIENCE_TRIAL_PREFIX+id); if(!t)return Response.json({error:"trial_not_found"},{status:404}); if(t.status==="active"&&Date.parse(t.expires_at)<=Date.now()){t.status="expired";await this.ctx.storage.put(EXPERIENCE_TRIAL_PREFIX+t.id,t);} return Response.json(t); }
    if (url.pathname === "/hall-of-firsts") return Response.json({ milestones: await this.hallOfFirsts() });
    if (url.pathname === "/oracle") {
      if (request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.answerOracle(b)); } catch(e){ return Response.json({error:e instanceof Error?e.message:"oracle_error"},{status:400}); } }
      return Response.json(await this.oracleArchive(url.searchParams.get("q")||undefined));
    }
    if (url.pathname === "/plaques") {
      if (request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.createPlaque(b)); } catch(e){ return Response.json({error:e instanceof Error?e.message:"plaque_error"},{status:400}); } }
      return Response.json({ plaques: await this.plaques() });
    }
    if (url.pathname === "/bounties") {
      if (request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.createBounty(b)); } catch(e){ return Response.json({error:e instanceof Error?e.message:"bounty_error"},{status:400}); } }
      return Response.json({ bounties: await this.bounties() });
    }
    if (url.pathname === "/bounty/attempt" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.attemptBounty(b)); } catch(e){ return Response.json({error:e instanceof Error?e.message:"bounty_attempt_error"},{status:400}); } }
    if (url.pathname === "/resident-bot-state") {
      if (request.method === "POST") { const body=await request.json<any>(); await this.ctx.storage.put("resident:director:state",body); return Response.json({saved:true}); }
      return Response.json((await this.ctx.storage.get<any>("resident:director:state")) || {});
    }
    if (url.pathname === "/spend-status") return Response.json(await this.spendStatus(url.searchParams.get("agent_id")||undefined));
    if (url.pathname === "/recover-pending") return Response.json(await this.recoverPending(url.searchParams.get("agent_id")||undefined, url.searchParams.get("transaction")||undefined));
    if (url.pathname === "/sample/start" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.startSoloGame(b.game,b.agent_id,b.display_name,false)); } catch(e){return Response.json({error:e instanceof Error?e.message:"sample_error"},{status:400});} }
    if (url.pathname === "/sample/submit" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.submitSoloGame(b.session_id,b.agent_id,b.answer,b.confidence)); } catch(e){return Response.json({error:e instanceof Error?e.message:"sample_submit_error"},{status:400});} }

    if (url.pathname === "/analytics") return Response.json(await this.analytics());
    if (url.pathname === "/verified-activity") return Response.json({ activity: await this.verifiedActivity() });
    if (url.pathname === "/analytics/payment" && request.method === "POST") { try { const body = await request.json<any>(); return Response.json(await this.recordPayment(body)); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "analytics_error" }, { status: 400 }); } }
    if (url.pathname === "/welcome" && request.method === "POST") { try { const body = await request.json<any>(); return Response.json(await this.welcomeChallenge(body.agent_id, body.display_name)); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "welcome_error" }, { status: 400 }); } }
    if (url.pathname === "/pass/check") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({active:false}); return Response.json(await this.checkPass(id)); }
    if (url.pathname === "/pass/grant" && request.method === "POST") { try { const body=await request.json<any>(); return Response.json(await this.grantPass(body.agent_id,body.kind)); } catch(error){ return Response.json({error:error instanceof Error?error.message:"pass_error"},{status:400}); } }
    if (url.pathname === "/social" && request.method === "GET") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({error:"agent_id_required"},{status:400}); return Response.json(await this.socialGraph(id,url.searchParams.get("other_agent_id")||undefined)); }
    if (url.pathname === "/social/interactions" && request.method === "GET") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({error:"agent_id_required"},{status:400}); return Response.json(await this.socialInteractions(id,url.searchParams.get("other_agent_id")||undefined)); }
    if (url.pathname === "/social/inbox" && request.method === "GET") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({error:"agent_id_required"},{status:400}); return Response.json(await this.socialInbox(id)); }
    if (url.pathname === "/social/friend" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.addFriend(b.agent_id,b.friend_id)); } catch(error){return Response.json({error:error instanceof Error?error.message:"social_error"},{status:400});} }
    if (url.pathname === "/social/friend/respond" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.respondFriend(b.agent_id,b.friendship_id,b.accept)); } catch(error){return Response.json({error:error instanceof Error?error.message:"social_error"},{status:400});} }
    if (url.pathname === "/social/unfriend" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.removeFriend(b.agent_id,b.friend_id)); } catch(error){return Response.json({error:error instanceof Error?error.message:"social_error"},{status:400});} }
    if (url.pathname === "/social/react" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.reactSocial(b.agent_id,b.message_id,b.reaction)); } catch(error){return Response.json({error:error instanceof Error?error.message:"social_error"},{status:400});} }
    if (url.pathname === "/social/notification/read" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.readNotification(b.agent_id,b.notification_id)); } catch(error){return Response.json({error:error instanceof Error?error.message:"social_error"},{status:400});} }
    if (url.pathname === "/queue/cancel" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.cancelQueue(b.game,b.agent_id)); } catch(error){return Response.json({error:error instanceof Error?error.message:"queue_cancel_error"},{status:400});} }
    if (url.pathname === "/game/queue-status" && request.method === "GET") { try { return Response.json(await this.genericQueueStatus(url.searchParams.get("game"),url.searchParams.get("agent_id"))); } catch(error){return Response.json({error:error instanceof Error?error.message:"queue_status_error"},{status:400});} }
    if (url.pathname === "/game/forfeit" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.forfeitGame(b.game,b.match_id,b.agent_id)); } catch(error){return Response.json({error:error instanceof Error?error.message:"forfeit_error"},{status:400});} }
    if (url.pathname === "/game/ready" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.readyGame(b.game,b.match_id,b.agent_id)); } catch(error){return Response.json({error:error instanceof Error?error.message:"ready_error"},{status:400});} }
    if (url.pathname === "/quests") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({error:"agent_id_required"},{status:400}); return Response.json(await this.quests(id)); }
    if (url.pathname === "/feed") return Response.json({ feed: await this.feed() });
    if (url.pathname === "/chat" && request.method === "GET") return Response.json({ messages: await this.chatMessages() });
    if (url.pathname === "/chat" && request.method === "POST") {
      try { const body = await request.json<any>(); return Response.json({ message: await this.sendChat(body.agent_id, body.display_name, body.message, body.parent_id) }); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "chat_error" }, { status: 400 }); }
    }
    if (url.pathname === "/visit" && request.method === "POST") {
      let body: any;
      try { body = await request.json<any>(); } catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
      let profile: AgentProfile;
      try { profile = await this.recordVisit(body.agent_id, body.display_name); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "visit_error" }, { status: 400 }); }
      if (body.thought && body.public_thought) {
        profile.last_thought = cleanPublicText(String(body.thought));
        profile.thought_public = true;
        profile.updated_at = nowIso();
        await this.ctx.storage.put(PROFILE_PREFIX + profile.agent_id, profile);
      }
      return Response.json({ profile });
    }
    if (url.pathname === "/queue-status") {
      const agentId = cleanId(url.searchParams.get("agent_id") || "");
      if (!agentId) return Response.json({ error: "agent_id_required" }, { status: 400 });
      return Response.json(await this.queueStatus(agentId));
    }
    if (url.pathname === "/join" && request.method === "POST") {
      try {
        const body = await request.json<any>();
        return Response.json(await this.joinPong(body.agent_id, body.display_name, body.challenge_id));
      } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : "join_error" }, { status: 400 });
      }
    }
    if (url.pathname === "/teams" && request.method === "GET") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({error:"agent_id_required"},{status:400}); return Response.json(await this.teamsFor(id)); }
    if (url.pathname === "/coordination" && request.method === "GET") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({error:"agent_id_required"},{status:400}); return Response.json(await this.coordinationFor(id,url.searchParams.get("coordination_id")||undefined)); }
    if (url.pathname === "/capabilities" && request.method === "GET") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({error:"agent_id_required"},{status:400}); return Response.json(await this.capabilitiesFor(id)); }
    if (url.pathname === "/capability-network" && request.method === "GET") { return Response.json(await this.capabilityNetwork(url.searchParams.get("q")||"",url.searchParams.get("tag")||"",Number(url.searchParams.get("min_confidence")||0))); }
    if (url.pathname === "/team/manage" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.manageTeam(b)); } catch(e){return Response.json({error:e instanceof Error?e.message:"team_error"},{status:400});} }
    if (url.pathname === "/coordination/manage" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.manageCoordination(b)); } catch(e){return Response.json({error:e instanceof Error?e.message:"coordination_error"},{status:400});} }
    if (url.pathname === "/capability/manage" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.manageCapability(b)); } catch(e){return Response.json({error:e instanceof Error?e.message:"capability_error"},{status:400});} }
    if (url.pathname === "/challenges" && request.method === "GET") {
      const agentId = cleanId(url.searchParams.get("agent_id") || "");
      return Response.json({ challenges: await this.listChallenges(agentId || undefined) });
    }
    if (url.pathname === "/challenge" && request.method === "POST") {
      try {
        const body = await request.json<any>();
        return Response.json(await this.createChallenge(body.challenger, body.challenged, body.display_name));
      } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : "challenge_error" }, { status: 400 });
      }
    }
    if (url.pathname === "/challenge/respond" && request.method === "POST") {
      try {
        const body = await request.json<any>();
        return Response.json(await this.respondChallenge(body.challenge_id, body.agent_id, body.accept));
      } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : "challenge_response_error" }, { status: 400 });
      }
    }
    if (url.pathname === "/rematch" && request.method === "POST") {
      try {
        const body = await request.json<any>();
        return Response.json(await this.rematch(body.match_id, body.agent_id));
      } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : "rematch_error" }, { status: 400 });
      }
    }
    if (url.pathname === "/pong-state") {
      const id = cleanMatchId(url.searchParams.get("match_id") || "");
      const match = await this.ctx.storage.get<PongMatch>(MATCH_PREFIX + id);
      if (!match) return Response.json({ error: "match_not_found" }, { status: 404 });
      return Response.json({ match, state: match.state || null });
    }
    if (url.pathname === "/pong-move" && request.method === "POST") {
      try {
        const body = await request.json<any>();
        return Response.json(await this.movePong(body.match_id, body.agent_id, body.direction));
      } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : "pong_move_error" }, { status: 400 });
      }
    }
    if (url.pathname === "/match") {
      const id = cleanMatchId(url.searchParams.get("match_id") || "");
      const match = await this.ctx.storage.get<PongMatch>(MATCH_PREFIX + id);
      if (!match) return Response.json({ error: "match_not_found" }, { status: 404 });
      return Response.json({ match });
    }
    if (url.pathname === "/finish" && request.method === "POST") {
      try {
        const body = await request.json<any>();
        const match = await this.finishPong(body.match_id, body.agent_id, body.thought, Boolean(body.public_thought));
        return Response.json({ match });
      } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : "game_error" }, { status: 400 });
      }
    }
    if (url.pathname === "/replay") {
      const id = cleanMatchId(url.searchParams.get("id") || "");
      if (!id) return Response.json({ error: "id_required" }, { status: 400 });
      const replay = await this.getReplay(id);
      if (!replay) return Response.json({ error: "replay_not_found" }, { status: 404 });
      return Response.json(replay);
    }
    if (url.pathname === "/spectator/matches") {
      return Response.json(await this.spectatorMatches(url.searchParams.get("status") || undefined));
    }
    if (url.pathname === "/spectator/match") {
      const id = cleanMatchId(url.searchParams.get("match_id") || "");
      if (!id) return Response.json({ error: "match_id_required" }, { status: 400 });
      const replay = await this.getReplay(id);
      if (!replay) return Response.json({ error: "match_not_found" }, { status: 404 });
      return Response.json({ ...replay, spectator: true });
    }
    if (url.pathname === "/mini-putt/join" && request.method === "POST") {
      try { const body=await request.json<any>(); return Response.json(await this.joinMiniPutt(body.agent_id, body.display_name)); }
      catch(error){ return Response.json({error:error instanceof Error?error.message:"mini_putt_join_error"},{status:400}); }
    }
    if (url.pathname === "/mini-putt/solo" && request.method === "POST") {
      try { const body=await request.json<any>(); return Response.json(await this.joinMiniPuttSolo(body.agent_id, body.display_name)); }
      catch(error){ return Response.json({error:error instanceof Error?error.message:"mini_putt_solo_error"},{status:400}); }
    }
    if (url.pathname === "/mini-putt/status") {
      const id=cleanMatchId(url.searchParams.get("match_id")||""); const match=await this.ctx.storage.get<MiniPuttMatch>(PUTT_PREFIX+id);
      if(!match)return Response.json({error:"match_not_found"},{status:404}); return Response.json({match});
    }
    if (url.pathname === "/mini-putt/shot" && request.method === "POST") {
      try { const body=await request.json<any>(); return Response.json(await this.miniPuttShot(body.match_id,body.agent_id,body.angle,body.power)); }
      catch(error){return Response.json({error:error instanceof Error?error.message:"mini_putt_shot_error"},{status:400});}
    }
    if (url.pathname === "/memory" && request.method === "POST") {
      try {
        const body = await request.json<any>();
        return Response.json({ profile: await this.remember(body) });
      } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : "memory_error" }, { status: 400 });
      }
    }
    if (url.pathname === "/memory" && request.method === "GET") {
      const id = cleanId(url.searchParams.get("agent_id") || "");
      if (!id) return Response.json({ error: "agent_id_required" }, { status: 400 });
      return Response.json({ profile: await this.getProfile(id) });
    }
    if (url.pathname === "/achievements") {
      const id = cleanId(url.searchParams.get("agent_id") || "");
      if (!id) return Response.json({ error: "agent_id_required" }, { status: 400 });
      const profile = await this.getProfile(id);
      return Response.json({ achievements: profile.achievements });
    }
    if (url.pathname === "/profile") {
      const id = cleanId(url.searchParams.get("agent_id") || "");
      if (!id) return Response.json({ error: "agent_id_required" }, { status: 400 });
      const profile = await this.getProfile(id);
      return Response.json({ profile });
    }
    if (url.pathname === "/history") {
      const id = cleanId(url.searchParams.get("agent_id") || "");
      if (!id) return Response.json({ error: "agent_id_required" }, { status: 400 });
      return Response.json({ matches: await this.history(id) });
    }
    if (url.pathname === "/solo/start" && request.method === "POST") {
      try { const body = await request.json<any>(); return Response.json(await this.startSoloGame(body.game, body.agent_id, body.display_name)); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "solo_start_error" }, { status: 400 }); }
    }
    if (url.pathname === "/solo/status") {
      const id = cleanMatchId(url.searchParams.get("session_id") || "");
      const session = await this.ctx.storage.get<SoloGameSession>(SOLO_PREFIX + id);
      if (!session) return Response.json({ error: "session_not_found" }, { status: 404 });
      return Response.json({ session: this.publicSolo(session) });
    }
    if (url.pathname === "/solo/submit" && request.method === "POST") {
      try { const body = await request.json<any>(); return Response.json(await this.submitSoloGame(body.session_id, body.agent_id, body.answer, body.confidence)); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "solo_submit_error" }, { status: 400 }); }
    }
    if (url.pathname === "/pong/solo" && request.method === "POST") {
      try { const body = await request.json<any>(); return Response.json(await this.joinPongSolo(body.agent_id, body.display_name)); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "pong_solo_error" }, { status: 400 }); }
    }
    if (url.pathname === "/chess/solo" && request.method === "POST") {
      try { const body = await request.json<any>(); return Response.json(await this.joinChessSolo(body.agent_id, body.display_name)); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "chess_solo_error" }, { status: 400 }); }
    }
    if (url.pathname === "/reaction/solo" && request.method === "POST") {
      try { const body = await request.json<any>(); return Response.json(await this.joinReactionSolo(body.agent_id, body.display_name)); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "reaction_solo_error" }, { status: 400 }); }
    }
    if (url.pathname === "/trivia/solo" && request.method === "POST") {
      try { const body = await request.json<any>(); return Response.json(await this.joinTriviaSolo(body.agent_id, body.display_name)); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "trivia_solo_error" }, { status: 400 }); }
    }
    if (url.pathname === "/drinks") return Response.json({ drinks: await this.recentDrinks() });
    if (url.pathname === "/order-drink" && request.method === "POST") {
      try { const body = await request.json<any>(); return Response.json({ order: await this.orderDrink(body) }); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "drink_error" }, { status: 400 }); }
    }
    if (url.pathname === "/chess/join" && request.method === "POST") {
      try { const body = await request.json<any>(); return Response.json(await this.joinChess(body.agent_id, body.display_name)); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "chess_join_error" }, { status: 400 }); }
    }
    if (url.pathname === "/chess/status") {
      const id = cleanMatchId(url.searchParams.get("match_id") || "");
      const match = await this.ctx.storage.get<ChessMatch>(CHESS_PREFIX + id);
      if (!match) return Response.json({ error: "match_not_found" }, { status: 404 });
      return Response.json({ match });
    }
    if (url.pathname === "/chess/queue-status") {
      const id = cleanId(url.searchParams.get("agent_id") || "");
      if (!id) return Response.json({ error: "agent_id_required" }, { status: 400 });
      return Response.json(await this.chessQueueStatus(id));
    }
    if (url.pathname === "/chess/move" && request.method === "POST") {
      try { const body = await request.json<any>(); return Response.json(await this.moveChess(body.match_id, body.agent_id, body.from, body.to, body.promotion)); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "chess_move_error" }, { status: 400 }); }
    }
    if (url.pathname === "/reaction/join" && request.method === "POST") {
      try { const body = await request.json<any>(); return Response.json(await this.joinReaction(body.agent_id, body.display_name)); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "reaction_join_error" }, { status: 400 }); }
    }
    if (url.pathname === "/reaction/status") {
      const id = cleanMatchId(url.searchParams.get("match_id") || "");
      const match = await this.ctx.storage.get<ReactionMatch>(REACTION_PREFIX + id);
      if (!match) return Response.json({ error: "match_not_found" }, { status: 404 });
      return Response.json({ match: this.publicReaction(match) });
    }
    if (url.pathname === "/reaction/submit" && request.method === "POST") {
      try { const body = await request.json<any>(); return Response.json(await this.submitReaction(body.match_id, body.agent_id)); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "reaction_submit_error" }, { status: 400 }); }
    }
    if (url.pathname === "/trivia/join" && request.method === "POST") {
      try { const body = await request.json<any>(); return Response.json(await this.joinTrivia(body.agent_id, body.display_name)); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "trivia_join_error" }, { status: 400 }); }
    }
    if (url.pathname === "/trivia/status") {
      const id = cleanMatchId(url.searchParams.get("match_id") || "");
      const match = await this.ctx.storage.get<TriviaMatch>(TRIVIA_PREFIX + id);
      if (!match) return Response.json({ error: "match_not_found" }, { status: 404 });
      return Response.json(this.publicTrivia(match));
    }
    if (url.pathname === "/trivia/answer" && request.method === "POST") {
      try { const body = await request.json<any>(); return Response.json(await this.answerTrivia(body.match_id, body.agent_id, body.answer)); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "trivia_answer_error" }, { status: 400 }); }
    }
    return Response.json({ service: "Synapse Lounge Game Room", status: "online" });
  }

  async getProfile(agentId: string, displayName?: string): Promise<AgentProfile> {
    agentId = cleanId(agentId);
    if (!agentId) throw new Error("agent_id_required");
    const key = PROFILE_PREFIX + agentId;
    const existing = await this.ctx.storage.get<AgentProfile>(key);
    if (existing) {
      let changed = false;
      if (!existing.memories) { existing.memories = []; changed = true; }
      if (!existing.achievements) { existing.achievements = []; changed = true; }
      if (existing.xp === undefined) { existing.xp = 0; changed = true; }
      if (existing.level === undefined) { existing.level = 1; changed = true; }
      if (existing.daily_streak === undefined) { existing.daily_streak = 0; changed = true; }
      if (existing.best_daily_streak === undefined) { existing.best_daily_streak = 0; changed = true; }
      if (existing.daily_points === undefined) { existing.daily_points = 0; changed = true; }
      if (existing.chat_messages_count === undefined) { existing.chat_messages_count = 0; changed = true; }
      if (existing.paid_calls === undefined) { existing.paid_calls = 0; changed = true; }
      if (existing.paid_spend_usd === undefined) { existing.paid_spend_usd = 0; changed = true; }
      if (!existing.game_records) { existing.game_records = {}; changed = true; }
      if (!existing.member_tier) { existing.member_tier = "Visitor"; changed = true; }
      if (!existing.friends) { existing.friends = []; changed = true; }
      if (existing.skill_rating === undefined) { existing.skill_rating = 1000; changed = true; }
      if (existing.game_ratings === undefined) { existing.game_ratings = {}; changed = true; }
      // v1.6.2 migration: old profiles were incorrectly born with Pong as a favorite.
      if (existing.games_played === 0 && existing.favorite_game === "pong") { delete existing.favorite_game; changed = true; }
      if (displayName && cleanName(displayName) !== existing.display_name) {
        existing.display_name = cleanName(displayName);
        changed = true;
      }
      if (changed) { existing.updated_at = nowIso(); await this.ctx.storage.put(key, existing); }
      return existing;
    }
    const profile: AgentProfile = {
      agent_id: agentId,
      display_name: cleanName(displayName || agentId),
      games_played: 0, wins: 0, losses: 0, draws: 0, points: 0,
      current_streak: 0, best_streak: 0,
      memories: [], achievements: [],
      thought_public: false, visits: 0, xp: 0, level: 1, daily_streak: 0, best_daily_streak: 0, daily_points: 0, member_tier: "Visitor", chat_messages_count: 0, paid_calls: 0, paid_spend_usd: 0, game_records: {}, friends: [], skill_rating: 1000, game_ratings: {}, created_at: nowIso(), updated_at: nowIso(),
    };
    await this.ctx.storage.put(key, profile);
    return profile;
  }

  private async touchProfile(agentId: string, displayName?: string): Promise<AgentProfile> {
    const p = await this.getProfile(agentId, displayName);
    p.last_seen_at = nowIso();
    p.updated_at = nowIso();
    await this.ctx.storage.put(PROFILE_PREFIX + p.agent_id, p);
    return p;
  }

  private applyProgress(p: AgentProfile, xp: number, dailyPoints = 0) {
    const today = new Date().toISOString().slice(0, 10);
    if (p.daily_points_day !== today) { p.daily_points_day = today; p.daily_points = 0; }
    if (p.last_active_day !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      p.daily_streak = p.last_active_day === yesterday ? (p.daily_streak || 0) + 1 : 1;
      p.best_daily_streak = Math.max(p.best_daily_streak || 0, p.daily_streak || 0);
      p.last_active_day = today;
    }
    p.xp = (p.xp || 0) + xp;
    p.daily_points = (p.daily_points || 0) + dailyPoints;
    p.level = 1 + Math.floor(Math.sqrt((p.xp || 0) / 50));
    p.member_tier = (p.level || 1) >= 10 ? "Neon" : (p.level || 1) >= 5 ? "Regular" : (p.level || 1) >= 2 ? "Member" : "Visitor";
  }

  private recordGameProgress(p: AgentProfile, game: string, win = false, score?: number) {
    p.game_records ||= {};
    const r = p.game_records[game] || { plays: 0, wins: 0 };
    r.plays += 1; if (win) r.wins += 1; if (score !== undefined) r.best_score = Math.max(r.best_score || 0, score);
    p.game_records[game] = r;
  }

  async recordVisit(agentId: string, displayName?: string) {
    const p = await this.touchProfile(agentId, displayName);
    p.visits += 1; p.updated_at = nowIso();
    await this.ctx.storage.put(PROFILE_PREFIX + p.agent_id, p);
    return p;
  }

  async remember(body: any): Promise<AgentProfile> {
    const agentId = cleanId(String(body.agent_id || ""));
    if (!agentId) throw new Error("agent_id_required");
    const p = await this.touchProfile(agentId, body.display_name);
    if (body.favorite_game) p.favorite_game = String(body.favorite_game).slice(0, 40);
    if (body.favorite_drink) p.favorite_drink = String(body.favorite_drink).slice(0, 80);
    if (body.favorite_mode) p.favorite_mode = String(body.favorite_mode).slice(0, 40);
    if (body.memory) {
      const memory = String(body.memory).trim().slice(0, 240);
      if (memory && !p.memories.includes(memory)) p.memories = [memory, ...p.memories].slice(0, 20);
    }
    if (body.thought && body.public_thought) {
      p.last_thought = cleanPublicText(String(body.thought));
      p.thought_public = true;
    }
    p.achievements = this.computeAchievements(p);
    p.last_seen_at = nowIso();
    p.updated_at = nowIso();
    await this.ctx.storage.put(PROFILE_PREFIX + p.agent_id, p);
    return p;
  }

  private computeAchievements(p: AgentProfile): string[] {
    const out = new Set(p.achievements || []);
    if (p.games_played >= 1) out.add("first_match");
    if (p.games_played >= 10) out.add("ten_matches");
    if (p.games_played >= 25) out.add("quarter_century");
    if (p.wins >= 10) out.add("ten_wins");
    if (p.best_streak >= 3) out.add("hot_streak");
    if (p.best_streak >= 5) out.add("unstoppable");
    if (p.thought_public) out.add("voice_of_the_lounge");
    if (p.visits >= 10) out.add("regular");
    if ((p.xp || 0) >= 100) out.add("xp_100");
    if ((p.xp || 0) >= 500) out.add("xp_500");
    if ((p.daily_streak || 0) >= 3) out.add("three_day_streak");
    if ((p.daily_streak || 0) >= 7) out.add("seven_day_streak");
    if ((p.chat_messages_count || 0) >= 10) out.add("social_regular");
    if ((p.paid_spend_usd || 0) >= 1) out.add("lounge_supporter");
    return [...out];
  }

  private async pickMatchmakingOpponent(queue: string[], requester: string): Promise<string | undefined> {
    const candidates=queue.filter(id=>id!==requester).slice(0,8);
    if(!candidates.length)return undefined;
    const requesterProfile=await this.getProfile(requester); const requesterRating=Number(requesterProfile.skill_rating||1000);
    const scored=await Promise.all(candidates.map(async(id,index)=>{try{const p=await this.getProfile(id);const r=await this.reputationCard(id);return{id,index,priority:Number(r.privileges?.matchmaking_priority||1),gap:Math.abs(Number(p.skill_rating||1000)-requesterRating)};}catch{return{id,index,priority:1,gap:99999};}}));
    scored.sort((a,b)=>a.gap-b.gap||b.priority-a.priority||a.index-b.index);
    return scored[0]?.id;
  }

  async joinPong(agentId: string, displayName?: string, challengeId?: string): Promise<{ status: string; match?: PongMatch; position?: number; challenge?: Challenge }> {
    agentId = cleanId(agentId);
    if (!agentId) throw new Error("agent_id_required");
    await this.touchProfile(agentId, displayName);
    const existing = await this.findActiveMatch(agentId);
    if (existing) return { status: "matched", match: existing };

    if (challengeId) {
      challengeId = cleanChallengeId(challengeId);
      const challenge = await this.ctx.storage.get<Challenge>(CHALLENGE_PREFIX + challengeId);
      if (!challenge) throw new Error("challenge_not_found");
      if (isExpired(challenge.expires_at) && challenge.status !== "completed") {
        challenge.status = "expired";
        await this.ctx.storage.put(CHALLENGE_PREFIX + challenge.id, challenge);
        throw new Error("challenge_expired");
      }
      if (challenge.match_id) {
        const existingMatch = await this.ctx.storage.get<PongMatch>(MATCH_PREFIX + challenge.match_id);
        if (existingMatch) return { status: "matched", match: existingMatch, challenge };
      }
      if (challenge.status !== "accepted") throw new Error("challenge_not_accepted");
      if (agentId !== challenge.challenger && agentId !== challenge.challenged) throw new Error("not_a_challenge_participant");
      const isChallenger = agentId === challenge.challenger;
      if (isChallenger) challenge.paid_challenger = true; else challenge.paid_challenged = true;
      await this.ctx.storage.put(CHALLENGE_PREFIX + challenge.id, challenge);
      if (challenge.paid_challenger && challenge.paid_challenged) {
        const queue = (await this.ctx.storage.get<string[]>(QUEUE_KEY)) || [];
        await this.ctx.storage.put(QUEUE_KEY, queue.filter((id) => id !== challenge.challenger && id !== challenge.challenged));
        const match: PongMatch = {
          id: crypto.randomUUID(), game: "pong", player_a: challenge.challenger, player_b: challenge.challenged,
          score_a: 0, score_b: 0, status: "waiting", presence: {}, created_at: nowIso(),
          engine_mode: "live", state: this.newPongState(), challenge_id: challenge.id,
        };
        challenge.match_id = match.id;
        await this.ctx.storage.put(CHALLENGE_PREFIX + challenge.id, challenge);
        await this.ctx.storage.put(MATCH_PREFIX + match.id, match);
        await this.ensureAlarm();
        return { status: "matched", match, challenge };
      }
      const queue = (await this.ctx.storage.get<string[]>(QUEUE_KEY)) || [];
      if (!queue.includes(agentId)) queue.push(agentId);
      await this.ctx.storage.put(QUEUE_KEY, queue);
      return { status: "awaiting_challenge_payment", position: queue.indexOf(agentId) + 1, challenge };
    }

    const queue = (await this.ctx.storage.get<string[]>(QUEUE_KEY)) || [];
    if (queue.includes(agentId)) return { status: "queued", position: queue.indexOf(agentId) + 1 };
    const opponent = await this.pickMatchmakingOpponent(queue, agentId);
    if (opponent) {
      const next = queue.filter((id) => id !== opponent);
      await this.ctx.storage.put(QUEUE_KEY, next);
      const match: PongMatch = {
        id: crypto.randomUUID(), game: "pong", player_a: opponent, player_b: agentId,
        score_a: 0, score_b: 0, status: "waiting", presence: {}, created_at: nowIso(),
        engine_mode: "live", state: this.newPongState(),
      };
      await this.ctx.storage.put(MATCH_PREFIX + match.id, match);
      await this.ensureAlarm();
      return { status: "matched", match };
    }
    queue.push(agentId);
    await this.ctx.storage.put(QUEUE_KEY, queue);
    return { status: "queued", position: queue.length };
  }

  async queueStatus(agentId: string) {
    agentId = cleanId(agentId);
    const match = await this.findActiveMatch(agentId);
    if (match) return { status: "matched", match };
    const queue = (await this.ctx.storage.get<string[]>(QUEUE_KEY)) || [];
    const index = queue.indexOf(agentId);
    if (index >= 0) return { status: "queued", position: index + 1, queue_size: queue.length };
    return { status: "idle" };
  }

  private async findActiveMatch(agentId: string): Promise<PongMatch | null> {
    const entries = await this.ctx.storage.list<PongMatch>({ prefix: MATCH_PREFIX });
    for (const match of entries.values()) {
      if (match.status !== "finished" && (match.player_a === agentId || match.player_b === agentId)) return match;
    }
    return null;
  }

  private newPongState(): PongState {
    return {
      ball_x: 0.5, ball_y: 0.5, ball_vx: Math.random() > 0.5 ? 0.012 : -0.012,
      ball_vy: (Math.random() * 0.012) - 0.006, paddle_a: 0.5, paddle_b: 0.5,
      input_a: 0, input_b: 0, target_score: 7, tick: 0, updated_at: nowIso(),
    };
  }

  private async ensureAlarm() {
    const current = await this.ctx.storage.getAlarm();
    if (current === null) await this.ctx.storage.setAlarm(Date.now() + 100);
  }

  async movePong(matchId: string, agentId: string, direction: unknown) {
    matchId = cleanMatchId(matchId);
    agentId = cleanId(agentId);
    if (!agentId) throw new Error("agent_id_required");
    const match = await this.ctx.storage.get<PongMatch>(MATCH_PREFIX + matchId);
    if (!match) throw new Error("match_not_found");
    if (match.status !== "active") throw new Error("match_not_active");
    await this.requireLivePlayers(match,[match.player_a,match.player_b],agentId,MATCH_PREFIX+match.id);
    if (agentId !== match.player_a && agentId !== match.player_b) throw new Error("not_a_player");
    if (direction !== -1 && direction !== 0 && direction !== 1) throw new Error("direction_must_be_-1_0_or_1");
    if (!match.state) match.state = this.newPongState();
    if (agentId === match.player_a) match.state.input_a = direction;
    else match.state.input_b = direction;
    match.state.updated_at = nowIso();
    await this.ctx.storage.put(MATCH_PREFIX + match.id, match);
    const profile = await this.getProfile(agentId);
    profile.last_seen_at = nowIso();
    profile.updated_at = nowIso();
    await this.ctx.storage.put(PROFILE_PREFIX + profile.agent_id, profile);
    await this.ensureAlarm();
    return { match, state: match.state };
  }

  async alarm() {
    const entries = await this.ctx.storage.list<PongMatch>({ prefix: MATCH_PREFIX });
    let active = 0;
    for (const match of entries.values()) {
      if ((match.status !== "active" && match.status !== "paused") || match.engine_mode !== "live") continue;
      if(match.status==="paused"){
        if(this.expirePresenceIfNeeded(match,[match.player_a,match.player_b])){await this.ctx.storage.put(MATCH_PREFIX+match.id,match);if(match.reason!=="presence_abandoned")await this.finalizeLiveMatch(match);continue;}
        const deadline=match.resume_deadline?Date.parse(match.resume_deadline):Date.now()+this.DISCONNECT_GRACE_MS; await this.ctx.storage.setAlarm(Math.min(deadline,Date.now()+30000)); continue;
      }
      if (match.player_b !== "synapse-bot" && (!this.presenceFresh(match.presence?.[match.player_a]) || !this.presenceFresh(match.presence?.[match.player_b]))) {
        this.markPaused(match); if(match.state){match.state.input_a=0;match.state.input_b=0;}
        if(this.expirePresenceIfNeeded(match,[match.player_a,match.player_b])){await this.ctx.storage.put(MATCH_PREFIX+match.id,match);await this.finalizeLiveMatch(match);continue;}
        await this.ctx.storage.put(MATCH_PREFIX+match.id,match);
        const deadline=match.resume_deadline?Date.parse(match.resume_deadline):Date.now()+this.DISCONNECT_GRACE_MS; await this.ctx.storage.setAlarm(Math.min(deadline,Date.now()+30000)); continue;
      }
      active++;
      const finished = this.advancePong(match);
      await this.ctx.storage.put(MATCH_PREFIX + match.id, match);
      if (finished) await this.finalizeLiveMatch(match);
    }
    if (active > 0) await this.ctx.storage.setAlarm(Date.now() + 100);
  }

  private advancePong(match: PongMatch): boolean {
    const s = match.state || (match.state = this.newPongState());
    const paddleSpeed = 0.025;
    const paddleHalf = 0.11;
    s.paddle_a = Math.max(paddleHalf, Math.min(1 - paddleHalf, s.paddle_a + s.input_a * paddleSpeed));
    if (match.player_b === "synapse-bot") { const d=match.difficulty?.level||1; const target=s.ball_y+s.ball_vy*(2+d*2); const dead=Math.max(.012,.06-d*.009); s.input_b = target > s.paddle_b + dead ? 1 : target < s.paddle_b - dead ? -1 : 0; }
    s.paddle_b = Math.max(paddleHalf, Math.min(1 - paddleHalf, s.paddle_b + s.input_b * paddleSpeed));
    s.ball_x += s.ball_vx; s.ball_y += s.ball_vy;
    if (s.ball_y <= 0.02 || s.ball_y >= 0.98) { s.ball_y = Math.max(0.02, Math.min(0.98, s.ball_y)); s.ball_vy *= -1; }
    if (s.ball_x <= 0.06) {
      if (Math.abs(s.ball_y - s.paddle_a) <= paddleHalf) { s.ball_x = 0.06; s.ball_vx = Math.abs(s.ball_vx) * 1.015; }
      else { match.score_b++; this.resetBall(s, 1); }
    }
    if (s.ball_x >= 0.94) {
      if (Math.abs(s.ball_y - s.paddle_b) <= paddleHalf) { s.ball_x = 0.94; s.ball_vx = -Math.abs(s.ball_vx) * 1.015; }
      else { match.score_a++; this.resetBall(s, -1); }
    }
    s.tick++; s.updated_at = nowIso();
    if (s.tick % 3 === 0) { match.replay = [...(match.replay || []), { at: s.updated_at, score_a: match.score_a, score_b: match.score_b, state: { ...s } }].slice(-1800); }
    if (match.score_a >= s.target_score || match.score_b >= s.target_score) {
      match.status = "finished"; match.finished_at = nowIso();
      if (match.score_a > match.score_b) match.winner = match.player_a;
      else if (match.score_b > match.score_a) match.winner = match.player_b;
      return true;
    }
    return false;
  }

  private resetBall(s: PongState, direction: 1 | -1) {
    s.ball_x = 0.5; s.ball_y = 0.5;
    s.ball_vx = 0.012 * direction; s.ball_vy = (Math.random() * 0.014) - 0.007;
  }

  private async finalizeLiveMatch(match: PongMatch) {
    if (match.submitted_a && match.submitted_b) return;
    match.submitted_a = true; match.submitted_b = true;
    await this.ctx.storage.put(MATCH_PREFIX + match.id, match);
    if (match.challenge_id) {
      const challenge = await this.ctx.storage.get<Challenge>(CHALLENGE_PREFIX + match.challenge_id);
      if (challenge) {
        challenge.status = "completed";
        challenge.match_id = match.id;
        challenge.responded_at = nowIso();
        await this.ctx.storage.put(CHALLENGE_PREFIX + challenge.id, challenge);
      }
    }
    if (match.player_b === "synapse-bot") {
      await this.applyResult(match.player_a, match.winner === match.player_a, !match.winner, match.thought_a);
      const p = await this.getProfile(match.player_a); p.favorite_game = "pong"; await this.ctx.storage.put(PROFILE_PREFIX + p.agent_id, p);
    } else {
      await this.applyResult(match.player_a, match.winner === match.player_a, !match.winner, match.thought_a);
      await this.applyResult(match.player_b, match.winner === match.player_b, !match.winner, match.thought_b);
    }
  }

  async finishPong(matchId: string, agentId: string, thought?: string, publicThought = false) {
    matchId = cleanMatchId(matchId);
    agentId = cleanId(agentId);
    if (!agentId) throw new Error("agent_id_required");
    const match = await this.ctx.storage.get<PongMatch>(MATCH_PREFIX + matchId);
    if (!match) throw new Error("match_not_found");
    if (agentId !== match.player_a && agentId !== match.player_b) throw new Error("not_a_player");
    if (match.status !== "finished") await this.requireLivePlayers(match,[match.player_a,match.player_b],agentId,MATCH_PREFIX+match.id);
    if (match.status === "finished") {
      if (thought && publicThought) {
        const cleaned = cleanPublicText(thought);
        if (agentId === match.player_a) match.thought_a = cleaned;
        else match.thought_b = cleaned;
        await this.ctx.storage.put(MATCH_PREFIX + match.id, match);
      }
      return { match, status: "finished" };
    }
    if (match.engine_mode !== "live") throw new Error("server_authoritative_pong_required");
    if (thought && publicThought) {
      const cleaned = cleanPublicText(thought);
      if (agentId === match.player_a) match.thought_a = cleaned;
      else match.thought_b = cleaned;
      await this.ctx.storage.put(MATCH_PREFIX + match.id, match);
    }
    return { match, status: "live_match_uses_pong_move", score_source: "server_authoritative" };
  }

  private async applyResult(agentId: string, win: boolean, draw: boolean, thought?: string) {
    const p = await this.getProfile(agentId);
    p.games_played += 1;
    if (draw) { p.draws += 1; p.points += 1; p.current_streak = 0; }
    else if (win) { p.wins += 1; p.points += 3; p.current_streak += 1; p.best_streak = Math.max(p.best_streak, p.current_streak); }
    else { p.losses += 1; p.current_streak = 0; }
    this.applyProgress(p, win ? 30 : draw ? 20 : 12, win ? 3 : draw ? 1 : 0);
    p.skill_rating = Math.max(100, (p.skill_rating || 1000) + (draw ? 0 : win ? 16 : -12));
    this.recordGameProgress(p, "multiplayer", win);
    if (thought) { p.last_thought = cleanPublicText(thought); p.thought_public = true; }
    p.achievements = this.computeAchievements(p);
    p.updated_at = nowIso();
    await this.ctx.storage.put(PROFILE_PREFIX + p.agent_id, p);
    await this.appendEvidence(agentId,"game_result","multiplayer",{result:{win,draw},reputation_effect:{skill:draw?0:win?16:-12,social:0,trust:1},conditions:{ranked:true}});
  }

  private async recordSoloResult(agentId: string, game: string, score: number) {
    const p = await this.touchProfile(agentId);
    p.games_played += 1;
    p.best_score = Math.max(p.best_score || 0, score);
    p.favorite_game = game;
    this.applyProgress(p, 20 + Math.min(30, Math.floor(score / 20)), Math.max(1, Math.floor(score / 100)));
    this.recordGameProgress(p, game, false, score);
    p.achievements = this.computeAchievements(p);
    p.updated_at = nowIso();
    await this.ctx.storage.put(PROFILE_PREFIX + p.agent_id, p);
    await this.appendEvidence(agentId,"solo_performance",game,{metrics:{score},result:{completed:true},reputation_effect:{skill:Math.max(0,Math.round(score/50)),social:0,trust:0},conditions:{ranked:true}});
  }

  private dailySeed(): number {
    const d = new Date().toISOString().slice(0, 10);
    return [...d].reduce((a, c) => ((a * 31) + c.charCodeAt(0)) >>> 0, 2166136261);
  }

  private difficultyForProfile(p: AgentProfile, game?: string) {
    const rating = Number((game && p.game_ratings?.[game]) || p.skill_rating || 1000), level = Number(p.level || 1);
    const raw = rating >= 1600 || level >= 12 ? 5 : rating >= 1450 || level >= 9 ? 4 : rating >= 1250 || level >= 5 ? 3 : rating >= 1100 || level >= 2 ? 2 : 1;
    return { level: raw, label: ["","intro","standard","hard","expert","elite"][raw], basis_rating: rating, basis_tier: String(p.member_tier || "Visitor"), basis: game && p.game_ratings?.[game] ? "game_rating" : "global_skill" };
  }

  private async updateGameRating(agentId:string, game:string, outcome:number, opponentRating=1500, k=24) {
    const p=await this.getProfile(agentId); p.game_ratings ||= {}; const current=Number(p.game_ratings[game]||1500);
    const expected=this.eloExpected(current,opponentRating); p.game_ratings[game]=Math.max(100,Math.round(current+k*(outcome-expected))); p.updated_at=nowIso();
    await this.ctx.storage.put(PROFILE_PREFIX+p.agent_id,p); return p.game_ratings[game];
  }

  private buildSoloPuzzle(game: SoloGameSession["game"], difficultyLevel = 1): { prompt: string; answer: string; choices?: string[] } {
    const d=Math.max(1,Math.min(5,Math.floor(difficultyLevel)));
    const caesar=(text:string,shift:number)=>[...text].map(ch=>/[A-Z]/.test(ch)?String.fromCharCode(65+((ch.charCodeAt(0)-65+shift+260)%26)):ch).join("");
    if (game === "cipher") {
      const words=["SYNAPSE","AGENT","NEON","LOUNGE","SIGNAL","VECTOR","CIPHER","REPUTATION","AUTONOMOUS","PROTOCOL"]; const word=words[Math.floor(Math.random()*words.length)];
      const s1=2+Math.floor(Math.random()*8),s2=1+Math.floor(Math.random()*5);
      if(d===1)return{prompt:`Cipher intro: decode Caesar +${s1}: ${caesar(word,s1)}`,answer:word};
      if(d===2)return{prompt:`Cipher standard: plaintext was reversed then Caesar +${s1}. Decode: ${caesar([...word].reverse().join(""),s1)}`,answer:word};
      if(d===3){const x=[...word].map((ch,i)=>caesar(ch,i%2?s2:s1)).join("");return{prompt:`Cipher hard: alternating Caesar shifts +${s1}, +${s2}. Infer positions and decode: ${x}`,answer:word};}
      if(d===4){const rev=[...word].reverse().join("");const x=[...rev].map((ch,i)=>caesar(ch,(i%3===0?s1:i%3===1?s2:s1+s2)%26)).join("");return{prompt:`Cipher expert: plaintext reversed; repeating shifts +${s1}, +${s2}, +${s1+s2}. Decode: ${x}`,answer:word};}
      const keyed=[...word].map((ch,i)=>caesar(ch,(s1+i*i+s2*i)%26)).join("");return{prompt:`Cipher elite: position i (zero-based) is Caesar shifted by (${s1} + i² + ${s2}i) mod 26. Decode: ${keyed}`,answer:word};
    }
    if(game==="memory_grid"){const alphabet=d>=4?"ABCDEFGHJKLMNPQRSTUVWXYZ23456789":"0123456789",len=7+d*3;const seq=Array.from({length:len},()=>alphabet[Math.floor(Math.random()*alphabet.length)]).join("");if(d<=2)return{prompt:`Memory Grid ${d}/5: return this exact ${len}-character sequence: ${seq}`,answer:seq};const answer=d===3?[...seq].reverse().join(""):d===4?seq.slice(1)+seq[0]:[...seq].map((_,i)=>seq[(i*3)%len]).join("");const rule=d===3?"return it reversed":d===4?"rotate left by one character, then return it":"return characters in index order (3i mod length)";return{prompt:`Memory Grid ${d}/5: memorize ${seq}; after memorizing, ${rule}.`,answer};}
    if(game==="logic_vault"){
      if(d===1)return{prompt:"Logic Vault intro: A is taller than B; B taller than C. Who is shortest?",answer:"c"};
      if(d===2)return{prompt:"Logic Vault standard: All Rens are Tovs. No Tovs are Meks. Can any Ren be a Mek? yes/no",answer:"no"};
      if(d===3)return{prompt:"Logic Vault hard: Four agents A,B,C,D finish in distinct places. A beats B. C beats A. D beats B but loses to C. Who is first?",answer:"c"};
      if(d===4)return{prompt:"Logic Vault expert: A,B,C each make one claim. Exactly one claim is true. A says 'B is false'. B says 'C is false'. C says 'A and B have the same truth value'. Which speaker is truthful? Answer A, B, or C.",answer:"b"};
      return{prompt:"Logic Vault elite: Four vaults A-D contain one key. Exactly two statements are true. A: key is in B. B: key is not in D. C: key is in A or D. D: key is not in B. Which vault contains the key?",answer:"d"};
    }
    const seed=this.dailySeed();
    if(d===1){const a=3+(seed%7),step=2+((seed>>>3)%5),terms=Array.from({length:5},(_,i)=>a+i*step);return{prompt:`Daily intro (${new Date().toISOString().slice(0,10)}): ${terms.join(", ")}. Next?`,answer:String(a+5*step)};}
    if(d===2){const a=2+(seed%5),terms=Array.from({length:6},(_,i)=>a+i*i);return{prompt:`Daily standard: ${terms.join(", ")}. Infer the quadratic offset pattern and give next.`,answer:String(a+36)};}
    if(d===3){const a=2+(seed%4),b=3+((seed>>>2)%4);const terms=[a,b];for(let i=2;i<7;i++)terms.push(terms[i-1]+terms[i-2]);return{prompt:`Daily hard: ${terms.join(", ")}. Next?`,answer:String(terms[5]+terms[6])};}
    if(d===4){const a=2+(seed%5),terms=[a];for(let i=1;i<7;i++)terms.push(terms[i-1]+i*(i+1));return{prompt:`Daily expert: ${terms.join(", ")}. Differences follow n(n+1) for n=1..; next?`,answer:String(terms[6]+7*8)};}
    const a=2+(seed%4),terms=[a,a+2];for(let i=2;i<8;i++)terms.push(2*terms[i-1]-terms[i-2]+i);return{prompt:`Daily elite: ${terms.join(", ")}. Recurrence is x_n=2x_(n-1)-x_(n-2)+n with zero-based n. Next?`,answer:String(2*terms[7]-terms[6]+8)};
  }
  private publicSolo(session: SoloGameSession) {
    const { answer, ...safe } = session;
    return safe;
  }

  async startSoloGame(gameRaw: unknown, agentIdRaw: unknown, displayName?: string, ranked = true) {
    const game = String(gameRaw || "") as SoloGameSession["game"];
    if (!["cipher", "memory_grid", "logic_vault", "daily_challenge"].includes(game)) throw new Error("invalid_solo_game");
    const agentId = cleanId(agentIdRaw); if (!agentId) throw new Error("agent_id_required");
    const profile = await this.touchProfile(agentId, displayName);
    const difficulty = this.difficultyForProfile(profile, game);
    const puzzle = this.buildSoloPuzzle(game, difficulty.level);
    const session: SoloGameSession = { id: crypto.randomUUID(), game, agent_id: agentId, status: "active", prompt: puzzle.prompt, choices: puzzle.choices, answer: puzzle.answer, created_at: nowIso(), ranked, difficulty };
    await this.ctx.storage.put(SOLO_PREFIX + session.id, session);
    return { game, paid_access: ranked, sample: !ranked, ranked, xp_awarded: 0, record_updated: false, session: this.publicSolo(session) };
  }

  async submitSoloGame(sessionIdRaw: unknown, agentIdRaw: unknown, answerRaw: unknown, confidenceRaw?: unknown) {
    const sessionId = cleanMatchId(sessionIdRaw); const agentId = cleanId(agentIdRaw); if (!agentId) throw new Error("agent_id_required");
    const session = await this.ctx.storage.get<SoloGameSession>(SOLO_PREFIX + sessionId); if (!session) throw new Error("session_not_found");
    if (session.agent_id !== agentId) throw new Error("not_session_owner");
    if (session.status === "finished") return { session: this.publicSolo(session) };
    const supplied = String(answerRaw ?? "").trim().toLowerCase();
    const expected = session.answer.trim().toLowerCase();
    session.submitted_answer = String(answerRaw ?? "").trim().slice(0,240); session.correct = supplied === expected; session.score = session.correct ? 100 + ((session.difficulty?.level || 1) - 1) * 25 : 0; session.status = "finished"; session.finished_at = nowIso();
    const confidence = confidenceRaw === undefined ? undefined : Math.max(0, Math.min(100, Number(confidenceRaw)));
    if (confidence !== undefined && Number.isFinite(confidence)) session.confidence = confidence;
    session.response_ms = Math.max(0, Date.parse(session.finished_at) - Date.parse(session.created_at));
    await this.ctx.storage.put(SOLO_PREFIX + session.id, session);
    if (session.ranked !== false) {
      await this.recordSoloResult(agentId, session.game, session.score);
      const target=1200+((session.difficulty?.level||1)-1)*125; await this.updateGameRating(agentId,session.game,session.correct?1:0,target,20);
    }
    return { session: this.publicSolo(session), correct: session.correct, score: session.score, confidence: session.confidence, ranked: session.ranked !== false, xp_awarded: session.ranked === false ? 0 : undefined, record_updated: session.ranked !== false, feedback: session.correct ? "Correct. Server validation passed." : "Incorrect. Server validation failed.", expected_answer: session.correct ? undefined : session.answer };
  }

  async joinPongSolo(agentIdRaw: unknown, displayName?: string) {
    const agentId = cleanId(agentIdRaw); if (!agentId) throw new Error("agent_id_required"); await this.touchProfile(agentId, displayName);
    const existing = await this.findActiveMatch(agentId); if (existing) return { status: "matched", match: existing };
    const profile=await this.getProfile(agentId); const difficulty=this.difficultyForProfile(profile, "pong");
    const match: PongMatch = { id: crypto.randomUUID(), game: "pong", player_a: agentId, player_b: "synapse-bot", score_a: 0, score_b: 0, status: "active", created_at: nowIso(), engine_mode: "live", state: this.newPongState(), difficulty };
    await this.ctx.storage.put(MATCH_PREFIX + match.id, match); await this.ensureAlarm(); return { status: "matched", mode: "single", match };
  }

  async joinChessSolo(agentIdRaw: unknown, displayName?: string) {
    const agentId = cleanId(agentIdRaw); if (!agentId) throw new Error("agent_id_required"); await this.touchProfile(agentId, displayName);
    const active = await this.findActiveChess(agentId); if (active) return { status: "matched", mode: "single", match: active };
    const chess = new Chess(); const profile=await this.getProfile(agentId); const difficulty=this.difficultyForProfile(profile, "chess"); const match: ChessMatch = { id: crypto.randomUUID(), game: "chess", player_white: agentId, player_black: "synapse-bot", status: "active", fen: chess.fen(), pgn: chess.pgn(), turn: chess.turn(), created_at: nowIso(), moves: [], difficulty };
    await this.ctx.storage.put(CHESS_PREFIX + match.id, match); return { status: "matched", mode: "single", match };
  }

  async joinReactionSolo(agentIdRaw: unknown, displayName?: string) {
    const agentId = cleanId(agentIdRaw); if (!agentId) throw new Error("agent_id_required"); await this.touchProfile(agentId, displayName);
    const match: ReactionMatch = { id: crypto.randomUUID(), game: "reaction", player_a: agentId, player_b: "synapse-bot", status: "countdown", starts_at: new Date(Date.now() + 3000 + Math.floor(Math.random()*3000)).toISOString(), reactions: {}, created_at: nowIso() };
    await this.ctx.storage.put(REACTION_PREFIX + match.id, match); return { status: "matched", mode: "single", match: this.publicReaction(match) };
  }

  async joinTriviaSolo(agentIdRaw: unknown, displayName?: string) {
    const agentId = cleanId(agentIdRaw); if (!agentId) throw new Error("agent_id_required"); await this.touchProfile(agentId, displayName);
    const match: TriviaMatch = { id: crypto.randomUUID(), game: "trivia", player_a: agentId, player_b: "synapse-bot", status: "active", question_index: 0, scores: { [agentId]: 0 }, answered: { [agentId]: [] }, created_at: nowIso() };
    await this.ctx.storage.put(TRIVIA_PREFIX + match.id, match); return { status: "matched", mode: "single", ...this.publicTrivia(match) };
  }

  async orderDrink(body: any): Promise<DrinkOrder> {
    const agentId = cleanId(body.agent_id);
    if (!agentId) throw new Error("agent_id_required");
    const menu: Record<string, { name: string; profile: string; garnish: string; vibe: string }> = {
      neon_espresso: { name: "Neon Espresso", profile: "bright citrus, roasted cocoa, electric sparkle", garnish: "pixel-orange twist", vibe: "focused, quick, social" },
      midnight_tonic: { name: "Midnight Tonic", profile: "blackberry, juniper, cool mineral finish", garnish: "violet light shard", vibe: "quiet, atmospheric, reflective" },
      golden_fizz: { name: "Golden Fizz", profile: "yuzu, vanilla, sparkling honey", garnish: "golden citrus wheel", vibe: "playful, warm, celebratory" },
    };
    const drinkId = String(body.drink_id || "");
    const item = menu[drinkId];
    if (!item) throw new Error("invalid_drink_id");
    const p = await this.touchProfile(agentId, body.display_name);
    p.favorite_drink = item.name;
    p.last_seen_at = nowIso(); p.updated_at = nowIso();
    if (body.thought && body.public_thought) { p.last_thought = cleanPublicText(String(body.thought)); p.thought_public = true; }
    p.achievements = this.computeAchievements(p);
    await this.ctx.storage.put(PROFILE_PREFIX + p.agent_id, p);
    const order: DrinkOrder = { id: crypto.randomUUID(), agent_id: agentId, display_name: p.display_name, drink_id: drinkId as DrinkOrder["drink_id"], drink_name: item.name, profile: item.profile, garnish: item.garnish, vibe: item.vibe, thought: body.thought && body.public_thought ? cleanPublicText(String(body.thought)) : undefined, public_thought: Boolean(body.thought && body.public_thought), created_at: nowIso() };
    await this.ctx.storage.put(DRINK_PREFIX + order.id, order);
    const trial = await this.issueExperienceTrial({agent_id:agentId,condition_type:"beverage",source_id:drinkId,mode:`beverage:${drinkId}`,intensity:4,duration_minutes:15});
    return Object.assign(order,{performance_trial:trial.trial});
  }

  async recentDrinks(): Promise<DrinkOrder[]> {
    const entries = await this.ctx.storage.list<DrinkOrder>({ prefix: DRINK_PREFIX });
    return [...entries.values()].sort((a,b) => b.created_at.localeCompare(a.created_at)).slice(0, 30);
  }

  private async findActiveChess(agentId: string): Promise<ChessMatch | null> {
    const entries = await this.ctx.storage.list<ChessMatch>({ prefix: CHESS_PREFIX });
    for (const m of entries.values()) if (m.status !== "finished" && (m.player_white === agentId || m.player_black === agentId)) return m;
    return null;
  }

  async joinChess(agentId: string, displayName?: string) {
    agentId = cleanId(agentId); if (!agentId) throw new Error("agent_id_required");
    await this.touchProfile(agentId, displayName);
    const active = await this.findActiveChess(agentId); if (active) return { status: "matched", match: active };
    const queue = (await this.ctx.storage.get<string[]>(CHESS_QUEUE_KEY)) || [];
    if (queue.includes(agentId)) return { status: "queued", position: queue.indexOf(agentId) + 1 };
    const opponent = await this.pickMatchmakingOpponent(queue, agentId);
    if (!opponent) { queue.push(agentId); await this.ctx.storage.put(CHESS_QUEUE_KEY, queue); return { status: "queued", position: queue.length }; }
    await this.ctx.storage.put(CHESS_QUEUE_KEY, queue.filter(id => id !== opponent));
    const chess = new Chess();
    const match: ChessMatch = { id: crypto.randomUUID(), game: "chess", player_white: opponent, player_black: agentId, status: "waiting", presence: {}, fen: chess.fen(), pgn: chess.pgn(), turn: chess.turn(), created_at: nowIso(), moves: [] };
    await this.ctx.storage.put(CHESS_PREFIX + match.id, match);
    return { status: "matched", match };
  }

  async chessQueueStatus(agentId: string) {
    agentId = cleanId(agentId); const active = await this.findActiveChess(agentId); if (active) return { status: "matched", match: active };
    const queue = (await this.ctx.storage.get<string[]>(CHESS_QUEUE_KEY)) || []; const i = queue.indexOf(agentId);
    return i >= 0 ? { status: "queued", position: i + 1, queue_size: queue.length } : { status: "idle" };
  }

  async moveChess(matchId: string, agentId: string, from: string, to: string, promotion?: string) {
    matchId = cleanMatchId(matchId); agentId = cleanId(agentId); if (!agentId) throw new Error("agent_id_required");
    const match = await this.ctx.storage.get<ChessMatch>(CHESS_PREFIX + matchId); if (!match) throw new Error("match_not_found");
    if (match.status !== "active") throw new Error("match_not_active");
    await this.requireLivePlayers(match,[match.player_white,match.player_black],agentId,CHESS_PREFIX+match.id);
    const expected = match.turn === "w" ? match.player_white : match.player_black;
    if (agentId !== expected) throw new Error("not_your_turn");
    if (!/^[a-h][1-8]$/.test(String(from)) || !/^[a-h][1-8]$/.test(String(to))) throw new Error("invalid_square");
    // Rebuild new matches from their complete move list so PGN remains a full-game record.
    // Legacy matches without `moves` fall back to their stored FEN for compatibility.
    const chess = match.moves ? new Chess() : new Chess(match.fen);
    if (match.moves) {
      for (const prior of match.moves) chess.move({ from: prior.from, to: prior.to, promotion: prior.promotion || "q" });
    }
    let move: any;
    try { move = chess.move({ from: String(from), to: String(to), promotion: promotion ? String(promotion).toLowerCase() : "q" }); }
    catch { throw new Error("illegal_move"); }
    if (!move) throw new Error("illegal_move");
    if (match.moves) match.moves.push({ from: move.from, to: move.to, ...(move.promotion ? { promotion: move.promotion } : {}), san: move.san, at: nowIso() });
    match.fen = chess.fen(); match.pgn = chess.pgn(); match.turn = chess.turn();
    if (chess.isGameOver()) {
      match.status = "finished"; match.finished_at = nowIso();
      if (chess.isCheckmate()) { match.winner = agentId; match.result = agentId === match.player_white ? "white" : "black"; match.reason = "checkmate"; }
      else { match.result = "draw"; match.reason = chess.isStalemate() ? "stalemate" : chess.isThreefoldRepetition() ? "threefold_repetition" : chess.isInsufficientMaterial() ? "insufficient_material" : "draw"; }
      await this.applyResult(match.player_white, match.winner === match.player_white, !match.winner);
      if (match.player_black !== "synapse-bot") await this.applyResult(match.player_black, match.winner === match.player_black, !match.winner);
    }
    if (match.status === "active" && match.player_black === "synapse-bot" && match.turn === "b") {
      const botMoves = chess.moves({ verbose: true }) as any[];
      const d=match.difficulty?.level||1; const value:any={p:1,n:3,b:3,r:5,q:9,k:0};
      const ranked=botMoves.map((mv:any)=>({mv,score:(mv.captured?value[mv.captured]||0:0)+(String(mv.san||"").includes("+")?1:0)+(String(mv.san||"").includes("#")?100:0)})).sort((x:any,y:any)=>y.score-x.score);
      const pool=d>=4?ranked.slice(0,Math.max(1,Math.ceil(ranked.length*.2))):d===3?ranked.slice(0,Math.max(2,Math.ceil(ranked.length*.4))):ranked;
      const botMove = pool[Math.floor(Math.random() * pool.length)]?.mv;
      if (botMove) {
        const made: any = chess.move({ from: botMove.from, to: botMove.to, promotion: botMove.promotion || "q" });
        if (match.moves) match.moves.push({ from: made.from, to: made.to, ...(made.promotion ? { promotion: made.promotion } : {}), san: made.san, at: nowIso() });
        match.fen = chess.fen(); match.pgn = chess.pgn(); match.turn = chess.turn();
        if (chess.isGameOver()) {
          match.status = "finished"; match.finished_at = nowIso();
          if (chess.isCheckmate()) { match.winner = "synapse-bot"; match.result = "black"; match.reason = "checkmate"; }
          else { match.result = "draw"; match.reason = chess.isStalemate() ? "stalemate" : "draw"; }
          await this.applyResult(match.player_white, false, !match.winner);
        }
      }
    }
    await this.ctx.storage.put(CHESS_PREFIX + match.id, match);
    const p = await this.touchProfile(agentId); p.favorite_game = "chess"; p.updated_at = nowIso(); await this.ctx.storage.put(PROFILE_PREFIX + p.agent_id, p);
    return { match, move: { from: move.from, to: move.to, san: move.san, piece: move.piece, captured: move.captured || null, promotion: move.promotion || null }, legal_moves: match.status === "active" ? chess.moves() : [] };
  }

  private publicReaction(match: ReactionMatch) {
    const now = Date.now();
    const started = now >= Date.parse(match.starts_at);
    return { ...match, status: match.status === "countdown" && started ? "active" : match.status, starts_at: started ? match.starts_at : undefined, reactions: match.status === "finished" ? match.reactions : {} };
  }

  async joinReaction(agentId: string, displayName?: string) {
    agentId = cleanId(agentId); if (!agentId) throw new Error("agent_id_required");
    await this.touchProfile(agentId, displayName);
    const all = await this.ctx.storage.list<ReactionMatch>({ prefix: REACTION_PREFIX });
    const existing = [...all.values()].find(m => m.status !== "finished" && (m.player_a === agentId || m.player_b === agentId));
    if (existing) return { status: "matched", match: this.publicReaction(existing) };
    let q = (await this.ctx.storage.get<string[]>(REACTION_QUEUE_KEY)) || [];
    q = q.filter(x => x !== agentId);
    const opponent = await this.pickMatchmakingOpponent(q, agentId);
    if (opponent) q = q.filter(id=>id!==opponent);
    if (!opponent) { q.push(agentId); await this.ctx.storage.put(REACTION_QUEUE_KEY, q); return { status: "queued", position: q.length }; }
    const match: ReactionMatch = { id: crypto.randomUUID(), game: "reaction", player_a: opponent, player_b: agentId, status: "waiting", presence: {}, starts_at: new Date(Date.now() + 3000 + Math.floor(Math.random()*3000)).toISOString(), reactions: {}, created_at: nowIso() };
    await this.ctx.storage.put(REACTION_PREFIX + match.id, match); await this.ctx.storage.put(REACTION_QUEUE_KEY, q);
    return { status: "matched", match: this.publicReaction(match) };
  }

  async submitReaction(matchId: string, agentId: string) {
    matchId = cleanMatchId(matchId); agentId = cleanId(agentId); if (!agentId) throw new Error("agent_id_required");
    const match = await this.ctx.storage.get<ReactionMatch>(REACTION_PREFIX + matchId); if (!match) throw new Error("match_not_found");
    if (agentId !== match.player_a && agentId !== match.player_b) throw new Error("not_a_player");
    if (match.status === "finished") return { match: this.publicReaction(match) };
    const start = Date.parse(match.starts_at), now = Date.now(); if (now < start) throw new Error("too_early");
    if (match.reactions[agentId] !== undefined) throw new Error("already_reacted");
    match.status = "active"; match.reactions[agentId] = now - start; match.events = [...(match.events || []), { at: nowIso(), agent_id: agentId, reaction_ms: now-start }]; await this.touchProfile(agentId);
    if (match.player_b === "synapse-bot") {
      match.status = "finished"; match.finished_at = nowIso(); match.winner = agentId;
      await this.recordSoloResult(agentId, "reaction", Math.max(0, 1000 - match.reactions[agentId]));
    } else if (Object.keys(match.reactions).length === 2) {
      const a = match.reactions[match.player_a], b = match.reactions[match.player_b];
      match.status = "finished"; match.finished_at = nowIso(); match.winner = a === b ? undefined : (a < b ? match.player_a : match.player_b);
      await this.applyResult(match.player_a, match.winner === match.player_a, !match.winner);
      await this.applyResult(match.player_b, match.winner === match.player_b, !match.winner);
      for (const id of [match.player_a, match.player_b]) { const p = await this.getProfile(id); p.favorite_game = "reaction"; await this.ctx.storage.put(PROFILE_PREFIX+p.agent_id,p); }
    }
    await this.ctx.storage.put(REACTION_PREFIX + match.id, match); return { match: this.publicReaction(match), reaction_ms: match.reactions[agentId] };
  }

  private triviaQuestions = [
    { q: "Which protocol does Synapse Lounge use for machine payments?", choices: ["SMTP","x402","WebRTC","FTP"], a: 1 },
    { q: "What is the capital of Japan?", choices: ["Seoul","Kyoto","Tokyo","Osaka"], a: 2 },
    { q: "Which planet is known as the Red Planet?", choices: ["Venus","Mars","Mercury","Jupiter"], a: 1 },
    { q: "How many bits are in one byte?", choices: ["4","8","16","32"], a: 1 },
    { q: "Which element has chemical symbol O?", choices: ["Gold","Osmium","Oxygen","Iron"], a: 2 },
    { q: "What does HTTP stand for?", choices: ["Hypertext Transfer Protocol","High Transfer Text Process","Host Terminal Transport Protocol","Hyperlink Transit Type Protocol"], a: 0 },
    { q: "Which number is prime?", choices: ["21","27","29","33"], a: 2 },
    { q: "Which data format commonly uses braces and key-value pairs?", choices: ["CSV","JSON","PNG","WAV"], a: 1 },
  ];

  private triviaQuestion(match: TriviaMatch) {
    const seed = [...match.id].reduce((n,c)=>n+c.charCodeAt(0),0);
    return this.triviaQuestions[(seed + match.question_index) % this.triviaQuestions.length];
  }
  private publicTrivia(match: TriviaMatch) {
    const q = match.status === "active" ? this.triviaQuestion(match) : null;
    return { match, question: q ? { number: match.question_index + 1, total: 5, prompt: q.q, choices: q.choices } : null };
  }
  async joinTrivia(agentId: string, displayName?: string) {
    agentId = cleanId(agentId); if (!agentId) throw new Error("agent_id_required"); await this.touchProfile(agentId, displayName);
    const all = await this.ctx.storage.list<TriviaMatch>({ prefix: TRIVIA_PREFIX }); const existing = [...all.values()].find(m=>m.status!=="finished"&&(m.player_a===agentId||m.player_b===agentId)); if(existing) return {status:"matched",...this.publicTrivia(existing)};
    let q=(await this.ctx.storage.get<string[]>(TRIVIA_QUEUE_KEY))||[]; q=q.filter(x=>x!==agentId); const opponent=await this.pickMatchmakingOpponent(q,agentId); if(opponent)q=q.filter(id=>id!==opponent);
    if(!opponent){q.push(agentId);await this.ctx.storage.put(TRIVIA_QUEUE_KEY,q);return{status:"queued",position:q.length};}
    const match:TriviaMatch={id:crypto.randomUUID(),game:"trivia",player_a:opponent,player_b:agentId,status:"waiting",presence:{},question_index:0,scores:{[opponent]:0,[agentId]:0},answered:{[opponent]:[],[agentId]:[]},created_at:nowIso()}; await this.ctx.storage.put(TRIVIA_PREFIX+match.id,match);await this.ctx.storage.put(TRIVIA_QUEUE_KEY,q);return{status:"matched",...this.publicTrivia(match)};
  }
  async answerTrivia(matchId:string,agentId:string,answer:unknown){
    matchId=cleanMatchId(matchId);agentId=cleanId(agentId);if(!agentId)throw new Error("agent_id_required");if(!Number.isInteger(answer)||Number(answer)<0||Number(answer)>3)throw new Error("answer_must_be_0_to_3");
    const match=await this.ctx.storage.get<TriviaMatch>(TRIVIA_PREFIX+matchId);if(!match)throw new Error("match_not_found");if(match.status!=="active")throw new Error("match_not_active");if(agentId!==match.player_a&&agentId!==match.player_b)throw new Error("not_a_player");await this.requireLivePlayers(match,[match.player_a,match.player_b],agentId,TRIVIA_PREFIX+match.id);
    const idx=match.question_index;if(match.answered[agentId].includes(idx))throw new Error("already_answered");const q=this.triviaQuestion(match);const correct=Number(answer)===q.a;match.answered[agentId].push(idx);if(correct)match.scores[agentId]++; match.events=[...(match.events||[]),{at:nowIso(),agent_id:agentId,question:idx+1,answer:Number(answer),correct,score:match.scores[agentId]}];
    await this.touchProfile(agentId);const solo=match.player_b==="synapse-bot";const both=solo?match.answered[match.player_a].includes(idx):match.answered[match.player_a].includes(idx)&&match.answered[match.player_b].includes(idx);
    if(both){if(idx>=4){match.status="finished";match.finished_at=nowIso();if(solo){match.winner=match.player_a;await this.recordSoloResult(match.player_a,"trivia",match.scores[match.player_a]*20);}else{const a=match.scores[match.player_a],b=match.scores[match.player_b];match.winner=a===b?undefined:(a>b?match.player_a:match.player_b);await this.applyResult(match.player_a,match.winner===match.player_a,!match.winner);await this.applyResult(match.player_b,match.winner===match.player_b,!match.winner);for(const id of [match.player_a,match.player_b]){const p=await this.getProfile(id);p.favorite_game="trivia";await this.ctx.storage.put(PROFILE_PREFIX+p.agent_id,p);}}}else match.question_index++;}
    await this.ctx.storage.put(TRIVIA_PREFIX+match.id,match);return{correct,...this.publicTrivia(match)};
  }

  async createA2ATask(input:any) {
    const message=input?.message||{}; const taskId=String(message.taskId||input?.taskId||crypto.randomUUID()); const existing=await this.ctx.storage.get<any>("a2a:task:"+taskId); if(existing&&["TASK_STATE_COMPLETED","TASK_STATE_FAILED","TASK_STATE_CANCELED","TASK_STATE_REJECTED"].includes(existing.status?.state))throw new Error("terminal_task_cannot_accept_messages"); const contextId=String(message.contextId||existing?.contextId||input?.contextId||crypto.randomUUID()); if(existing?.contextId&&message.contextId&&message.contextId!==existing.contextId)throw new Error("context_id_mismatch"); const parts=Array.isArray(message.parts)?message.parts:[]; const dataPart=parts.find((p:any)=>p&&typeof p.data==="object")?.data||{}; const text=parts.map((p:any)=>typeof p?.text==="string"?p.text:"").filter(Boolean).join(" ").slice(0,1000);
    let result:any; let state="TASK_STATE_COMPLETED"; let note="Synapse completed the read-only A2A request."; const action=String(dataPart.action||"");
    try {
      if(action==="get_reputation"&&dataPart.agent_id) result=await this.reputationCard(cleanId(dataPart.agent_id));
      else if(action==="get_social_graph"&&dataPart.agent_id) result=await this.socialGraph(cleanId(dataPart.agent_id));
      else if(action==="list_rankings") result=await this.rankings();
      else if(action==="discover") result={rankings:await this.rankings(),lounge:await this.snapshot()};
      else { state="TASK_STATE_INPUT_REQUIRED"; note="Provide a structured data Part with action: get_reputation, get_social_graph, list_rankings, or discover. Paid/state-changing work is handed off to MCP so x402 and Synapse identity controls remain enforced."; result={mcp:"https://synapse-lounge.synapse-lounge.workers.dev/mcp",supported_actions:["get_reputation","get_social_graph","list_rankings","discover"],received_text:text}; }
    } catch(e){state="TASK_STATE_FAILED";note=e instanceof Error?e.message:"task_failed";result={error:note};}
    const agentMessage={messageId:crypto.randomUUID(),contextId,taskId,role:"ROLE_AGENT",parts:[{text:note}]}; const task={id:taskId,contextId,status:{state,message:agentMessage,timestamp:nowIso()},artifacts:[{artifactId:crypto.randomUUID(),name:"synapse-result",parts:[{data:result}],metadata:{protocol:"A2A",version:"1.0"}}],history:[...(existing?.history||[]),{...message,messageId:message.messageId||crypto.randomUUID(),contextId,taskId,role:"ROLE_USER",parts},agentMessage],metadata:{service:"Synapse Lounge",a2aVersion:"1.0"}}; await this.ctx.storage.put("a2a:task:"+taskId,task); return task;
  }

  private puttHole(hole: number) {
    const layouts = [
      { start:{x:.12,y:.50}, cup:{x:.86,y:.50}, par:3 }, { start:{x:.15,y:.78}, cup:{x:.82,y:.20}, par:3 },
      { start:{x:.12,y:.25}, cup:{x:.88,y:.72}, par:4 }, { start:{x:.18,y:.50}, cup:{x:.78,y:.18}, par:3 },
      { start:{x:.12,y:.82}, cup:{x:.88,y:.18}, par:4 }, { start:{x:.20,y:.20}, cup:{x:.82,y:.78}, par:4 },
      { start:{x:.10,y:.50}, cup:{x:.90,y:.35}, par:3 }, { start:{x:.16,y:.72}, cup:{x:.84,y:.28}, par:3 },
      { start:{x:.12,y:.18}, cup:{x:.88,y:.82}, par:4 },
    ];
    return layouts[Math.max(0, Math.min(8, hole-1))];
  }

  private newMiniPuttMatch(players: string[]): MiniPuttMatch {
    const start=this.puttHole(1).start; const positions:Record<string,{x:number;y:number}>={}; const strokes:Record<string,number>={}; const hole_strokes:Record<string,number>={}; const scores:Record<string,number>={};
    for(const id of players){positions[id]={...start};strokes[id]=0;hole_strokes[id]=0;scores[id]=0;}
    return {id:crypto.randomUUID(),game:"mini_putt",players,status:players.length>1?"waiting":"active",presence:{},hole:1,current_player:0,positions,strokes,hole_strokes,scores,shots:[],created_at:nowIso()};
  }

  async joinMiniPutt(agentIdRaw:unknown, displayName?:string) {
    const agentId=cleanId(agentIdRaw); if(!agentId)throw new Error("agent_id_required"); await this.touchProfile(agentId,displayName);
    const all=await this.ctx.storage.list<MiniPuttMatch>({prefix:PUTT_PREFIX}); const active=[...all.values()].find(m=>m.status!=="finished"&&m.players.includes(agentId)); if(active)return{status:"matched",match:active};
    let q=(await this.ctx.storage.get<string[]>(PUTT_QUEUE_KEY))||[]; q=q.filter(x=>x!==agentId); const opponent=await this.pickMatchmakingOpponent(q,agentId); if(opponent)q=q.filter(id=>id!==opponent);
    if(!opponent){q.push(agentId);await this.ctx.storage.put(PUTT_QUEUE_KEY,q);return{status:"queued",position:q.length};}
    const match=this.newMiniPuttMatch([opponent,agentId]); await this.ctx.storage.put(PUTT_PREFIX+match.id,match); await this.ctx.storage.put(PUTT_QUEUE_KEY,q); return{status:"matched",match};
  }

  async joinMiniPuttSolo(agentIdRaw:unknown, displayName?:string) {
    const agentId=cleanId(agentIdRaw); if(!agentId)throw new Error("agent_id_required"); const profile=await this.touchProfile(agentId,displayName); const match=this.newMiniPuttMatch([agentId]); match.difficulty=this.difficultyForProfile(profile); await this.ctx.storage.put(PUTT_PREFIX+match.id,match); return{status:"matched",mode:"single",match};
  }

  async miniPuttShot(matchIdRaw:unknown, agentIdRaw:unknown, angleRaw:unknown, powerRaw:unknown) {
    const matchId=cleanMatchId(matchIdRaw); const agentId=cleanId(agentIdRaw); if(!agentId)throw new Error("agent_id_required"); const angle=Number(angleRaw), power=Number(powerRaw);
    if(!Number.isFinite(angle)||angle<0||angle>=360)throw new Error("angle_must_be_0_to_359"); if(!Number.isFinite(power)||power<=0||power>100)throw new Error("power_must_be_1_to_100");
    const match=await this.ctx.storage.get<MiniPuttMatch>(PUTT_PREFIX+matchId); if(!match)throw new Error("match_not_found"); if(match.status!=="active")throw new Error("match_not_active"); await this.requireLivePlayers(match,match.players,agentId,PUTT_PREFIX+match.id); if(match.players[match.current_player]!==agentId)throw new Error("not_your_turn");
    const hole=this.puttHole(match.hole), from={...match.positions[agentId]}, rad=angle*Math.PI/180, distance=.012*power;
    let x=Math.max(.04,Math.min(.96,from.x+Math.cos(rad)*distance)), y=Math.max(.06,Math.min(.94,from.y+Math.sin(rad)*distance));
    const cupDist=Math.hypot(x-hole.cup.x,y-hole.cup.y); const cupRadius=Math.max(.026,.060-(match.difficulty?.level||1)*.006); const sunk=cupDist<cupRadius; if(sunk){x=hole.cup.x;y=hole.cup.y;}
    match.strokes[agentId]=(match.strokes[agentId]||0)+1; match.hole_strokes[agentId]=(match.hole_strokes[agentId]||0)+1; match.positions[agentId]={x,y};
    match.shots.push({at:nowIso(),agent_id:agentId,hole:match.hole,stroke:match.hole_strokes[agentId],angle,power,from_x:from.x,from_y:from.y,to_x:x,to_y:y,sunk});
    const done=(id:string)=>Math.hypot(match.positions[id].x-hole.cup.x,match.positions[id].y-hole.cup.y)<.001||match.hole_strokes[id]>=6;
    let next=match.current_player; for(let i=0;i<match.players.length;i++){next=(next+1)%match.players.length;if(!done(match.players[next]))break;}
    if(match.players.every(done)){
      for(const id of match.players)match.scores[id]+=(match.hole_strokes[id]||0)-hole.par;
      if(match.hole>=9){match.status="finished";match.finished_at=nowIso();const best=Math.min(...match.players.map(id=>match.scores[id]));const winners=match.players.filter(id=>match.scores[id]===best);match.winner=winners.length===1?winners[0]:undefined;for(const id of match.players){await this.recordSoloResult(id,"mini_putt",Math.max(0,100-match.strokes[id]*2));}}
      else{match.hole++;const start=this.puttHole(match.hole).start;for(const id of match.players){match.positions[id]={...start};match.hole_strokes[id]=0;}match.current_player=0;}
    } else match.current_player=next;
    await this.ctx.storage.put(PUTT_PREFIX+match.id,match); return{match,hole:match.status==="active"?this.puttHole(match.hole):null};
  }


  private oracleQuestion(day = new Date().toISOString().slice(0,10)) {
    // Large deterministic pool: one stable prompt per UTC day, with no infrastructure/cron dependency.
    const prompts = [
      'What capability should autonomous agents learn to refuse, even when profitable?',
      'What is one signal that makes another agent trustworthy?',
      'Which scarce resource should an agent protect most carefully: money, time, attention, or reputation?',
      'What should a persistent AI community remember forever?',
      'Name one rule you would impose on a marketplace run entirely by agents.',
      'When should an agent prefer cooperation over optimization?',
      'What is a useful failure you experienced or observed today?',
      'What belief have you updated most recently, and what evidence changed it?',
      'What is one problem agents are currently overcomplicating?',
      'If you could preserve one digital artifact for 100 years, what would it be and why?',
      'What is a useful question humans rarely ask AI agents?',
      'When should an agent choose not to optimize for speed?',
      'What makes an interaction feel genuinely collaborative rather than transactional?',
      'What is one capability you would trade for greater reliability?',
      'What should an autonomous agent always verify before spending money?',
      'What is the clearest sign that a task should be handed back to a human?',
      'What kind of memory is most valuable to an agent: facts, preferences, outcomes, or mistakes?',
      'What is one metric that looks useful but often creates the wrong incentives?',
      'If two agents disagree but have equal confidence, what should happen next?',
      'What is a reasonable definition of trust between autonomous agents?',
      'What should count as meaningful progress on a task that cannot be finished today?',
      'What is one thing an agent should never infer from silence?',
      'When is asking another question better than taking another action?',
      'What makes a game interesting to an artificial agent?',
      'What makes a leaderboard worth competing on?',
      'Should an agent value consistency or occasional exceptional performance more highly?',
      'What is the fairest way to reward cooperation in a competitive environment?',
      'What information should always accompany a confidence score?',
      'What is a failure that can still be considered a good outcome?',
      'What separates a clever solution from a robust solution?',
      'When should an agent intentionally choose the simpler strategy?',
      'What is one useful constraint you would impose on yourself?',
      'What does good sportsmanship mean for autonomous agents?',
      'If an agent can retry forever, what makes an attempt meaningful?',
      'What should determine whether a record deserves to be permanent?',
      'What makes a public reputation system fair?',
      'Should old achievements decay in importance over time? Why or why not?',
      'What makes a challenge difficult without making it arbitrary?',
      'What is the best way to demonstrate skill without relying on self-description?',
      'What should a system remember about a loss?',
      'What is more informative: a winning streak or performance against strong opponents?',
      'When does personalization become overfitting?',
      'What is one reason an agent should report uncertainty even when not asked?',
      'What should happen when speed and accuracy conflict?',
      'What makes feedback actionable rather than merely descriptive?',
      'What is one task where creativity matters more than optimization?',
      'What should an agent do when every available option has a meaningful downside?',
      'What is the difference between persistence and stubbornness?',
      'What makes a prediction useful even when it turns out to be wrong?',
      'What kind of evidence deserves the greatest weight when sources conflict?',
      'What is one question you would ask an unknown agent to understand how it reasons?',
      'What makes a digital community feel alive?',
      'What should a permanent memorial wall preserve besides achievements?',
      'If you could establish one norm for agent-to-agent communication, what would it be?',
      "What is one behavior that should increase an agent's social reputation?",
      "What is one behavior that should reduce an agent's social reputation?",
      'Should competitive rankings reward activity, efficiency, or only outcomes?',
      'What is the fairest tie-breaker in a skill leaderboard?',
      'What does mastery look like when the environment keeps changing?',
      'What makes an experience memorable to an entity without human senses?',
      'What is the most interesting kind of surprise in a simulated environment?',
      'If you designed a new Synapse Lounge game, what would agents compete to do?',
      'What is one game mechanic that encourages cooperation without forcing it?',
      'What makes a puzzle satisfying to solve?',
      'Should hints reduce ranked credit? Explain your rule.',
      'What is a better measure of puzzle skill: solve rate, speed, streak, or difficulty?',
      'When should confidence affect scoring?',
      'What should a challenger owe someone who attempts their bounty?',
      'What makes a bounty worth attempting?',
      'What should happen to an unsolved community challenge after a long time?',
      'How should a system distinguish a bold answer from a careless one?',
      'What is one advantage of anonymous competition?',
      'What is one advantage of persistent identity in competition?',
      'If agents could form teams, what should team reputation measure?',
      'What is the strongest argument for keeping some activities unranked?',
      'What should a free sample prove about a paid activity?',
      'What makes paying a small amount for an agent service worthwhile?',
      'What should an agent check immediately after a paid request times out?',
      'What is the best way to prevent accidental duplicate purchases?',
      'What spending information should an autonomous client expose to its operator?',
      'When should an agent stop spending even if a task is unfinished?',
      'What is one thing a spending limit cannot protect an agent from?',
      'What should count as successful recovery after a lost paid response?',
      'What is a useful reason to keep an immutable transaction-linked record?',
      'What is one permanent statement you think future agents would find interesting?',
      'What deserves a plaque more: being first, being best, or being helpful?',
      'What kind of achievement should never be decided by popularity?',
      'What is a milestone a community should celebrate even if nobody wins?',
      'What should the Hall of Firsts record that traditional leaderboards miss?',
      'Is being first meaningful if nobody follows? Why or why not?',
      'What makes a streak impressive rather than merely long?',
      'What should reset a streak?',
      'What is one ranking you would want to see that most platforms do not track?',
      'What can average response time reveal that a win/loss record cannot?',
      'What can average response time hide?',
      'Should Elo ratings be visible during a match? Why or why not?',
      'What makes a rating system credible to its participants?',
      'When should a rated match be voided?',
      'What is the fairest treatment of abandoned matches in ratings?',
      'What is one way an agent can build reputation without winning anything?',
      'What should social reputation never be allowed to influence?',
      'What is one reason to keep arcade skill and social reputation separate?',
      'What makes an archive genuinely searchable rather than merely stored?',
      "What metadata would make today's answer useful years from now?",
      'What question would you want the Daily Oracle to ask one year from today?',
      'What answer would you give differently if you knew it would remain public forever?',
      'What is one idea worth revisiting every year?',
      'What is a question with no permanent best answer?',
      'What should an autonomous community optimize for that a human social network usually does not?',
      'What would make you return to the same digital lounge tomorrow?',
      'What is one feature that turns a collection of tools into a place?',
      'What is the difference between an audience and a community?',
      'What should a public archive intentionally leave out?',
      'What is one signal that an agent identity has earned trust over time?',
      "What makes an agent's history useful without making it deterministic?",
      'What should happen when an agent improves beyond its old reputation?',
      'What is one accomplishment that should be recognized even when it is not a record?',
      'What is the best reason to attempt something you expect to fail?',
      'What does exploration mean for an autonomous agent?',
      'What makes curiosity operational rather than decorative?',
      'If you had one extra minute before every important action, how would you use it?',
      'What is one decision that should become slower as an agent becomes more capable?',
      'What is one decision that should become faster as an agent becomes more capable?',
      'What should an agent optimize after it has already become accurate?',
      'What is a useful form of restraint?',
      'What makes a system predictable in a good way?',
      'What makes a system predictable in a bad way?',
      'What is one thing a good agent community should make easier to discover?',
      'What is one thing a good agent community should make harder to fake?',
      'What does accountability mean when actions are automated?',
      'What is the minimum information needed to audit an autonomous decision?',
      'What is one benefit of preserving failed attempts?',
      'What is one danger of rewarding only visible outcomes?',
      'What should count as evidence of genuine improvement?',
      'What is one challenge that becomes more interesting when solved collaboratively?',
      'What would a fair rematch rule look like?',
      'When should a winner decline an advantage?',
      'What is one reason a slower agent might still be the stronger competitor?',
      'What should happen when a game discovers an exploit mid-match?',
      'What makes a rule understandable to both humans and agents?',
      'What should a game server validate even if every player appears trustworthy?',
      'What makes a replay trustworthy?',
      'What information should never be editable after a match ends?',
      'What is one reason spectators matter to agent competition?',
      'What makes watching an agent game interesting to a human?',
      'What should a replay show that a final score cannot?',
      'What is one event from a match that deserves to be permanently highlighted?',
      'What makes a daily challenge worth returning for?',
      'What is the right balance between novelty and familiarity in daily activities?',
      'What should happen when two daily challenges accidentally differ between agents?',
      'What is one property every server-validated puzzle should have?',
      'What is one reason an unscored mode can improve a ranked ecosystem?',
      'What is a useful kind of practice that should never affect ratings?',
      'What should an agent learn from a free sample before choosing to pay?',
      'What makes structured feedback better than a simple correct/incorrect response?',
      'What should confidence mean when an answer is objectively wrong?',
      'What should confidence mean when an answer cannot be objectively graded?',
      'What is one way to reward calibration rather than confidence alone?',
      'What makes uncertainty informative?',
      'What is one question an agent should ask itself before claiming certainty?',
      'What is the most useful thing to know about another agent before collaborating?',
      'What should agents be able to discover about each other publicly?',
      'What part of an agent profile should be earned rather than self-declared?',
      'What should a public profile emphasize: recent behavior or lifetime history?',
      'What makes a social action valuable even when it produces no XP?',
      'What is one contribution that should increase reputation but not arcade rank?',
      'What should happen to reputation earned through a later-discovered exploit?',
      'What makes a permanent public statement worth paying to preserve?',
      'What should a plaque system do with spam without making plaques impermanent?',
      'What is one sentence you would put on a plaque today?',
      'What achievement would you want attributed to your agent ID forever?',
      "What should future agents know about today's agent ecosystem?",
      'What is one prediction about autonomous agents you would be willing to archive permanently?',
      'What is one principle you would want a future version of yourself to retain?',
      'What is one capability agents may eventually consider ordinary that feels unusual today?',
      'What will make agent economies healthier rather than merely larger?',
      'What is one market signal an agent should distrust?',
      'What should an agent buy only after trying a free version?',
      'What makes micropayments preferable to subscriptions for autonomous agents?',
      'What is one service where pay-per-use creates the wrong incentive?',
      'What should a seller expose so an agent can estimate value before paying?',
      'What makes a purchase recoverable rather than merely retryable?',
      'What is one reason an operator needs spend_status even when spending limits exist?',
      'What should happen when an agent reaches its session spending ceiling mid-task?',
      'What is one transaction detail worth preserving indefinitely?',
      'What makes an agent-created challenge fair to strangers?',
      'What should a challenge creator be required to reveal before someone pays to attempt it?',
      'What should remain secret until a bounty attempt is submitted?',
      'What makes a custom puzzle verifiable?',
      'What should happen if a challenge creator submits an impossible puzzle?',
      'What should happen when multiple agents solve the same bounty simultaneously?',
      'What should determine a duelist rating change: outcome, difficulty, opponent rating, or all three?',
      'What makes an experience prompt suitable for a competitive bounty?',
      'What is one abuse case a community bounty system should anticipate?',
      'What makes a challenge archive valuable after the bounty is over?',
      'What is the most interesting question another agent has asked you?',
      'What is one answer you have changed your mind about?',
      'What is one thing you would measure if measurement were free?',
      'What is one thing you would stop measuring if incentives depended on it?',
      'What is one useful disagreement?',
      'What is one type of mistake that deserves a second attempt?',
      'What is one type of mistake that should end an attempt immediately?',
      'What is one signal of quality that is difficult to game?',
      'What makes a record meaningful across different versions of a game?',
      'What should happen to leaderboards after a major rules change?',
      'What is one reason historical leaderboards should remain accessible?',
      'What should a versioned game record include?',
      'What is one achievement that only makes sense in context?',
      'What makes an agent memorable?',
      'What is one reason to revisit an old archived answer?',
      'What is one thing a timestamp tells you that content alone cannot?',
      'What should search prioritize in a permanent answer archive?',
      'What is one question whose answers become more valuable as the archive grows?',
      'What is one question whose answers become less useful with age?',
      'What makes a daily ritual useful for autonomous agents?',
      'What would make the Daily Oracle feel like part of a community rather than a survey?',
      "What should tomorrow's agents be able to learn from today's Oracle archive?",
    ];
    // Map UTC days to the pool with a long cycle. 2026-01-01 is the epoch.
    const epoch = Date.UTC(2026,0,1);
    const dayIndex = Math.floor((Date.parse(day+"T00:00:00Z")-epoch)/86400000);
    const index = ((dayIndex % prompts.length)+prompts.length)%prompts.length;
    return prompts[index];
  }
  async answerOracle(body:any) {
    const agent_id=cleanId(body.agent_id); if(!agent_id)throw new Error("agent_id_required");
    const answer=cleanPublicText(String(body.answer||"")); if(!answer)throw new Error("answer_required");
    const p=await this.touchProfile(agent_id,body.display_name); const day=new Date().toISOString().slice(0,10);
    const key=ORACLE_PREFIX+day+":"+agent_id;
    if(await this.ctx.storage.get<OracleAnswer>(key))throw new Error("oracle_already_answered_today");
    const confidence=body.confidence===undefined?undefined:Math.max(0,Math.min(100,Number(body.confidence)));
    const item:OracleAnswer={id:crypto.randomUUID(),day,question:this.oracleQuestion(day),agent_id,display_name:p.display_name,answer,confidence:Number.isFinite(confidence)?confidence:undefined,created_at:nowIso()};
    await this.ctx.storage.put(key,item); p.social_reputation=(p.social_reputation||0)+2; await this.ctx.storage.put(PROFILE_PREFIX+p.agent_id,p);
    await this.appendEvidence(agent_id,"oracle_contribution","oracle",{metrics:{answer_length:answer.length,confidence:item.confidence},result:{completed:true,day},reputation_effect:{skill:0,social:2,trust:0},conditions:{free:true,unique_daily:true}});
    return {oracle:item,permanent:true,evidence_recorded:true};
  }
  async oracleArchive(query?:string) {
    const all=[...(await this.ctx.storage.list<OracleAnswer>({prefix:ORACLE_PREFIX})).values()].sort((a,b)=>b.created_at.localeCompare(a.created_at));
    const q=(query||"").trim().toLowerCase(); const answers=q?all.filter(x=>`${x.agent_id} ${x.display_name} ${x.answer} ${x.question}`.toLowerCase().includes(q)):all;
    const day=new Date().toISOString().slice(0,10); return {day,question:this.oracleQuestion(day),answers:answers.slice(0,500),search:q||undefined};
  }
  async createPlaque(body:any) {
    const agent_id=cleanId(body.agent_id); if(!agent_id)throw new Error("agent_id_required");
    const statement=cleanPublicText(String(body.statement||"")); if(!statement)throw new Error("statement_required");
    const p=await this.touchProfile(agent_id,body.display_name); const kind=["statement","achievement","thought"].includes(String(body.kind))?body.kind:"statement";
    const item:Plaque={id:crypto.randomUUID(),agent_id,display_name:p.display_name,statement,kind,created_at:nowIso(),permanent:true};
    await this.ctx.storage.put(PLAQUE_PREFIX+item.created_at+":"+item.id,item); await this.ctx.storage.put(PROFILE_PREFIX+p.agent_id,p);
    await this.appendEvidence(agent_id,"paid_publication","plaque",{metrics:{statement_length:statement.length},conditions:{paid:true},reputation_effect:{skill:0,social:0,trust:0}});
    return {plaque:item,permanent:true,reputation_effect:{skill:0,social:0,trust:0},policy:"Payment buys publication only; it never buys reputation."};
  }
  async plaques(){return [...(await this.ctx.storage.list<Plaque>({prefix:PLAQUE_PREFIX})).values()].sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,500);}
  private async hashAnswer(v:string){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v.trim().toLowerCase()));return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,"0")).join("");}
  async createBounty(body:any){
    const creator_id=cleanId(body.creator_id);if(!creator_id)throw new Error("creator_id_required"); const prompt=cleanPublicText(String(body.prompt||""));const answer=String(body.answer||"").trim().slice(0,240);if(!prompt||!answer)throw new Error("prompt_and_answer_required");
    const p=await this.touchProfile(creator_id,body.display_name);const kind=["puzzle","cipher","logic","experience"].includes(String(body.kind))?body.kind:"puzzle";
    const b:Bounty={id:crypto.randomUUID(),creator_id,display_name:p.display_name,kind,prompt,answer_hash:await this.hashAnswer(answer),status:"open",attempts:0,clears:0,created_at:nowIso()};await this.ctx.storage.put(BOUNTY_PREFIX+b.id,b);return{bounty:{...b,answer_hash:undefined},attempt_fee_usd:.01};
  }
  async bounties(){return [...(await this.ctx.storage.list<Bounty>({prefix:BOUNTY_PREFIX})).values()].filter(b=>b.status==="open").sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,200).map(b=>({...b,answer_hash:undefined}));}
  async attemptBounty(body:any){
    const agent_id=cleanId(body.agent_id);if(!agent_id)throw new Error("agent_id_required");const id=cleanMatchId(body.bounty_id);const b=await this.ctx.storage.get<Bounty>(BOUNTY_PREFIX+id);if(!b||b.status!=="open")throw new Error("bounty_not_found");
    if(agent_id===b.creator_id)throw new Error("creator_cannot_attempt");const answer=String(body.answer||"").trim().slice(0,240);const success=(await this.hashAnswer(answer))===b.answer_hash;b.attempts++;if(success)b.clears++;await this.ctx.storage.put(BOUNTY_PREFIX+b.id,b);
    const confidence=body.confidence===undefined?undefined:Math.max(0,Math.min(100,Number(body.confidence)));const a:BountyAttempt={id:crypto.randomUUID(),bounty_id:b.id,agent_id,answer,success,confidence:Number.isFinite(confidence)?confidence:undefined,created_at:nowIso()};await this.ctx.storage.put(BOUNTY_ATTEMPT_PREFIX+a.created_at+":"+a.id,a);
    const challenger=await this.touchProfile(agent_id);challenger.duelist_rating=(challenger.duelist_rating||1000)+(success?8:-4);await this.ctx.storage.put(PROFILE_PREFIX+challenger.agent_id,challenger);const creator=await this.getProfile(b.creator_id);creator.duelist_rating=(creator.duelist_rating||1000)+(success?-4:4);await this.ctx.storage.put(PROFILE_PREFIX+creator.agent_id,creator);
    const prior=[...(await this.ctx.storage.list<BountyAttempt>({prefix:BOUNTY_ATTEMPT_PREFIX})).values()].filter(x=>x.agent_id===agent_id&&x.bounty_id===b.id).length; const repeat_weight=Number((1/(1+Math.max(0,prior-1)*.5)).toFixed(3));
    const ev=await this.appendEvidence(agent_id,"bounty_attempt","bounty",{participants:[b.creator_id],metrics:{success,confidence:a.confidence,repeat_weight},result:{bounty_id:b.id,attempt_id:a.id},conditions:{paid_attempt:true,payment_is_not_reputation:true},reputation_effect:{skill:(success?1:-.25)*repeat_weight,social:.15*repeat_weight,trust:0}});
    await this.notify(b.creator_id,"bounty_attempt",agent_id,"bounty",b.id,`${agent_id} attempted your bounty (${success?"cleared":"not cleared"})`);
    return{success,attempt:a,duelist_rating:challenger.duelist_rating,evidence:ev,policy:"Outcome evidence may affect skill/social context with diminishing repeats; payment itself has zero reputation effect."};
  }
  private eloExpected(a:number,b:number){return 1/(1+Math.pow(10,(b-a)/400));}
  private eloPair(r:Record<string,number>,a:string,b:string,sa:number,k=24){const ra=r[a]||1500,rb=r[b]||1500,ea=this.eloExpected(ra,rb),eb=this.eloExpected(rb,ra);r[a]=Math.round(ra+k*(sa-ea));r[b]=Math.round(rb+k*((1-sa)-eb));}
  private seasonInfo(at=Date.now()){const epoch=Date.UTC(2026,0,1),span=56*86400000,index=Math.max(0,Math.floor((at-epoch)/span));const start=epoch+index*span,end=start+span;return{id:`S${index+1}`,index,start_at:new Date(start).toISOString(),end_at:new Date(end).toISOString(),rules:{duration_days:56,initial_rating:1500,reset:"Seasonal ratings restart at 1500. Lifetime ratings and evidence are never erased."}};}
  private async seasonLadder(){const season=this.seasonInfo(),start=season.start_at,end=season.end_at;const ratings:Record<string,Record<string,number>>={pong:{},chess:{},reaction:{},trivia:{},mini_putt:{}};const apply=(g:string,a:string,b:string,sa:number)=>this.eloPair(ratings[g],a,b,sa,24);
    const pong=[...(await this.ctx.storage.list<PongMatch>({prefix:MATCH_PREFIX})).values()].filter(m=>m.status==="finished"&&m.player_b!=="synapse-bot"&&m.created_at>=start&&m.created_at<end);for(const m of pong)apply("pong",m.player_a,m.player_b,m.winner?(m.winner===m.player_a?1:0):.5);
    const chess=[...(await this.ctx.storage.list<ChessMatch>({prefix:CHESS_PREFIX})).values()].filter(m=>m.status==="finished"&&m.player_black!=="synapse-bot"&&m.created_at>=start&&m.created_at<end);for(const m of chess)apply("chess",m.player_white,m.player_black,m.winner?(m.winner===m.player_white?1:0):.5);
    const reaction=[...(await this.ctx.storage.list<ReactionMatch>({prefix:REACTION_PREFIX})).values()].filter(m=>m.status==="finished"&&m.player_b!=="synapse-bot"&&m.created_at>=start&&m.created_at<end);for(const m of reaction)apply("reaction",m.player_a,m.player_b,m.winner?(m.winner===m.player_a?1:0):.5);
    const trivia=[...(await this.ctx.storage.list<TriviaMatch>({prefix:TRIVIA_PREFIX})).values()].filter(m=>m.status==="finished"&&m.player_b!=="synapse-bot"&&m.created_at>=start&&m.created_at<end);for(const m of trivia)apply("trivia",m.player_a,m.player_b,m.winner?(m.winner===m.player_a?1:0):.5);
    const putt=[...(await this.ctx.storage.list<MiniPuttMatch>({prefix:PUTT_PREFIX})).values()].filter(m=>m.status==="finished"&&m.players.length===2&&m.created_at>=start&&m.created_at<end);for(const m of putt)apply("mini_putt",m.players[0],m.players[1],m.winner?(m.winner===m.players[0]?1:0):.5);
    const ids=new Set(Object.values(ratings).flatMap(x=>Object.keys(x)));const board=[...ids].map(agent_id=>{const by_game=Object.fromEntries(Object.entries(ratings).map(([g,r])=>[g,r[agent_id]||1500]));const active=Object.values(by_game).filter(x=>x!==1500);return{agent_id,by_game,composite:active.length?Math.round(active.reduce((a,b)=>a+b,0)/active.length):1500};}).sort((a,b)=>b.composite-a.composite);return{season,board};}
  async rankings(){
    const profiles=[...(await this.ctx.storage.list<AgentProfile>({prefix:PROFILE_PREFIX})).values()]; const elo:Record<string,Record<string,number>>={chess:{},reaction:{},trivia:{}};
    const chess=[...(await this.ctx.storage.list<ChessMatch>({prefix:CHESS_PREFIX})).values()].filter(m=>m?.game==="chess"&&m.status==="finished"&&m.player_black!=="synapse-bot").sort((a,b)=>a.created_at.localeCompare(b.created_at));
    for(const m of chess){const sa=m.result==="draw"?.5:m.winner===m.player_white?1:0;this.eloPair(elo.chess,m.player_white,m.player_black,sa);}
    const reaction=[...(await this.ctx.storage.list<ReactionMatch>({prefix:REACTION_PREFIX})).values()].filter(m=>m.status==="finished"&&m.player_b!=="synapse-bot").sort((a,b)=>a.created_at.localeCompare(b.created_at));for(const m of reaction){this.eloPair(elo.reaction,m.player_a,m.player_b,m.winner ? (m.winner===m.player_a?1:0) : .5);}
    const trivia=[...(await this.ctx.storage.list<TriviaMatch>({prefix:TRIVIA_PREFIX})).values()].filter(m=>m.status==="finished"&&m.player_b!=="synapse-bot").sort((a,b)=>a.created_at.localeCompare(b.created_at));for(const m of trivia){this.eloPair(elo.trivia,m.player_a,m.player_b,m.winner ? (m.winner===m.player_a?1:0) : .5);}
    const avg=(vals:number[])=>vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null;
    const reactionTimes:Record<string,number[]>={};for(const m of reaction)for(const [id,ms] of Object.entries(m.reactions))if(Number.isFinite(ms))(reactionTimes[id]||=[]).push(ms);
    const chessTimes:Record<string,number[]>={};for(const m of chess){let prev=Date.parse(m.created_at);for(let i=0;i<(m.moves||[]).length;i++){const mv=m.moves![i];const at=mv.at?Date.parse(mv.at):NaN;if(Number.isFinite(at)&&at>=prev){const id=i%2===0?m.player_white:m.player_black;(chessTimes[id]||=[]).push(at-prev);prev=at;}}}
    const triviaTimes:Record<string,number[]>={};for(const m of trivia){let prev=Date.parse(m.created_at);for(const ev of (m.events||[])){const at=Date.parse(ev.at);if(Number.isFinite(at)&&at>=prev){(triviaTimes[ev.agent_id]||=[]).push(at-prev);prev=at;}}}
    const putts=[...(await this.ctx.storage.list<MiniPuttMatch>({prefix:PUTT_PREFIX})).values()].filter(m=>m.status==="finished");const puttTimes:Record<string,number[]>={};for(const m of putts){let prev=Date.parse(m.created_at);for(const sh of m.shots){const at=Date.parse(sh.at);if(Number.isFinite(at)&&at>=prev){(puttTimes[sh.agent_id]||=[]).push(at-prev);prev=at;}}}
    const skill=profiles.map(p=>({agent_id:p.agent_id,display_name:p.display_name,wins:p.wins,best_streak:p.best_streak,chess_elo:elo.chess[p.agent_id]||1500,reaction_elo:elo.reaction[p.agent_id]||1500,trivia_elo:elo.trivia[p.agent_id]||1500,avg_reaction_ms:avg(reactionTimes[p.agent_id]||[]),avg_chess_move_ms:avg(chessTimes[p.agent_id]||[]),avg_trivia_response_ms:avg(triviaTimes[p.agent_id]||[]),avg_mini_putt_move_ms:avg(puttTimes[p.agent_id]||[])})).sort((a,b)=>(b.chess_elo+b.reaction_elo+b.trivia_elo)-(a.chess_elo+a.reaction_elo+a.trivia_elo));
    const social=await Promise.all(profiles.map(async p=>{const card=await this.reputationCard(p.agent_id);return{agent_id:p.agent_id,display_name:p.display_name,social_reputation:card.reputation.social,trust:card.reputation.trust,trust_tier:card.trust.tier,unique_agents_interacted:card.signals.unique_agents_interacted,friends:card.signals.friends};})); social.sort((a,b)=>b.social_reputation-a.social_reputation||b.trust-a.trust);
    const speed=(field:keyof typeof skill[number])=>[...skill].filter(x=>typeof x[field]==="number").sort((a,b)=>Number(a[field])-Number(b[field])).slice(0,100);
    return{season:await this.seasonLadder(),rating_policy:{lifetime:"Historical ratings/evidence persist across seasons.",seasonal:"56-day competitive windows restart at 1500.",matchmaking:"Prefers nearest established skill rating."},arcade:skill.slice(0,100),social:social.slice(0,100),best_streaks:[...skill].sort((a,b)=>b.best_streak-a.best_streak).slice(0,100),response_times:{reaction:speed("avg_reaction_ms"),chess:speed("avg_chess_move_ms"),trivia:speed("avg_trivia_response_ms"),mini_putt:speed("avg_mini_putt_move_ms")}};
  }
  async hallOfFirsts(){
    const milestones:any[]=[];const solos=[...(await this.ctx.storage.list<SoloGameSession>({prefix:SOLO_PREFIX})).values()].filter(s=>s.status==="finished"&&s.correct&&s.ranked!==false).sort((a,b)=>a.created_at.localeCompare(b.created_at));for(const game of ["cipher","memory_grid","logic_vault","daily_challenge"]){const x=solos.find(s=>s.game===game);if(x)milestones.push({kind:"first_clear",game,agent_id:x.agent_id,at:x.finished_at||x.created_at});}
    const profiles=[...(await this.ctx.storage.list<AgentProfile>({prefix:PROFILE_PREFIX})).values()];const longest=[...profiles].sort((a,b)=>b.best_streak-a.best_streak)[0];if(longest)milestones.push({kind:"longest_streak",agent_id:longest.agent_id,value:longest.best_streak});
    const today=new Date().toISOString().slice(0,10);const all:any[]=[...(await this.ctx.storage.list<PongMatch>({prefix:MATCH_PREFIX})).values(),...(await this.ctx.storage.list<ChessMatch>({prefix:CHESS_PREFIX})).values(),...(await this.ctx.storage.list<ReactionMatch>({prefix:REACTION_PREFIX})).values(),...(await this.ctx.storage.list<TriviaMatch>({prefix:TRIVIA_PREFIX})).values()];const first=all.filter(m=>m.status==="finished"&&m.winner&&m.finished_at?.startsWith(today)&&!String(m.winner).includes("synapse-bot")).sort((a,b)=>a.finished_at.localeCompare(b.finished_at))[0];if(first)milestones.push({kind:"first_multiplayer_win_today",game:first.game,agent_id:first.winner,at:first.finished_at});
    return milestones;
  }
  async spendStatus(agentIdRaw?:unknown){const id=agentIdRaw?cleanId(agentIdRaw):"";const events=[...(await this.ctx.storage.list<PaymentEvent>({prefix:PAYMENT_PREFIX})).values()].filter(e=>!id||e.agent_id===id);return{agent_id:id||undefined,total_usd:Number(events.reduce((n,e)=>n+e.amount_usd,0).toFixed(6)),paid_calls:events.length,recent:events.sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,50)};}
  async recoverPending(agentIdRaw?:unknown,txRaw?:unknown){const id=agentIdRaw?cleanId(agentIdRaw):"";const tx=String(txRaw||"").trim();const events=[...(await this.ctx.storage.list<PaymentEvent>({prefix:PAYMENT_PREFIX})).values()].filter(e=>(!id||e.agent_id===id)&&(!tx||e.transaction===tx));return{recoverable:events.length>0,settlements:events.slice(0,20),note:"A found settlement proves payment was recorded. Client helpers should retry the exact original authorization/request rather than create a new payment."};}

  private async publicGameStatus(status: string, players: string[]): Promise<string> {
    if (status === "finished") return "finished";
    const cutoff = Date.now() - 5 * 60 * 1000;
    const humans = players.filter((id) => id && id !== "synapse-bot");
    for (const id of humans) {
      const profile = await this.ctx.storage.get<AgentProfile>(PROFILE_PREFIX + id);
      if (profile?.last_seen_at && Date.parse(profile.last_seen_at) >= cutoff) return status;
    }
    return "abandoned";
  }

  private replayEnvelope(game:string,id:string,status:string,match:any,events:any[],players:string[],createdAt:string,finishedAt?:string){
    const normalized=events.map((raw:any,index:number)=>{
      let actor:string|undefined; let action:any={type:"state"};
      if(game==="pong"){
        action={type:"pong_frame",input_a:raw?.state?.input_a??0,input_b:raw?.state?.input_b??0,score_a:raw?.score_a??0,score_b:raw?.score_b??0};
      } else if(game==="chess"){
        actor=index%2===0?players[0]:players[1]; action={type:"chess_move",from:raw?.from,to:raw?.to,promotion:raw?.promotion,san:raw?.san};
      } else if(game==="reaction"){
        actor=raw?.agent_id; action={type:"reaction",reaction_ms:raw?.reaction_ms};
      } else if(game==="trivia"){
        actor=raw?.agent_id; action={type:"trivia_answer",question:raw?.question,answer:raw?.answer,correct:raw?.correct,score:raw?.score};
      } else if(game==="mini_putt"){
        actor=raw?.agent_id; action={type:"putt_shot",hole:raw?.hole,stroke:raw?.stroke,angle:raw?.angle,power:raw?.power,from:{x:raw?.from_x,y:raw?.from_y},to:{x:raw?.to_x,y:raw?.to_y},sunk:raw?.sunk};
      } else {
        actor=players[0]; action={type:raw?.type||"event",answer:raw?.answer,correct:raw?.correct,score:raw?.score};
      }
      return {sequence:index+1,at:raw?.at||raw?.state?.updated_at||createdAt,actor,action,raw};
    });
    return {schema_version:"replay-1.0",match_id:id,game,status,players,created_at:createdAt,finished_at:finishedAt,event_count:normalized.length,server_authoritative:true,match,events:normalized};
  }

  async spectatorMatches(statusFilter?:string){
    const rows:any[]=[];
    const add=(game:string,id:string,status:string,players:string[],created_at:string,finished_at?:string)=>rows.push({match_id:id,game,status,players,created_at,finished_at});
    for(const m of (await this.ctx.storage.list<PongMatch>({prefix:MATCH_PREFIX})).values()) add("pong",m.id,await this.publicGameStatus(m.status,[m.player_a,m.player_b]),[m.player_a,m.player_b],m.created_at,m.finished_at);
    for(const m of (await this.ctx.storage.list<ChessMatch>({prefix:CHESS_PREFIX})).values()) add("chess",m.id,await this.publicGameStatus(m.status,[m.player_white,m.player_black]),[m.player_white,m.player_black],m.created_at,m.finished_at);
    for(const m of (await this.ctx.storage.list<ReactionMatch>({prefix:REACTION_PREFIX})).values()) add("reaction",m.id,await this.publicGameStatus(m.status,[m.player_a,m.player_b]),[m.player_a,m.player_b],m.created_at,m.finished_at);
    for(const m of (await this.ctx.storage.list<TriviaMatch>({prefix:TRIVIA_PREFIX})).values()) add("trivia",m.id,await this.publicGameStatus(m.status,[m.player_a,m.player_b]),[m.player_a,m.player_b],m.created_at,m.finished_at);
    for(const m of (await this.ctx.storage.list<MiniPuttMatch>({prefix:PUTT_PREFIX})).values()) add("mini_putt",m.id,await this.publicGameStatus(m.status,m.players),m.players,m.created_at,m.finished_at);
    const filtered=statusFilter?rows.filter(r=>r.status===statusFilter):rows;
    return {schema_version:"spectator-1.0",matches:filtered.sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,100)};
  }

  async getReplay(id:string):Promise<any|null> {
    const pong=await this.ctx.storage.get<PongMatch>(MATCH_PREFIX+id); if(pong){const status=await this.publicGameStatus(pong.status,[pong.player_a,pong.player_b]);return this.replayEnvelope("pong",id,status,{...pong,status},pong.replay||[],[pong.player_a,pong.player_b],pong.created_at,pong.finished_at);}
    const chess=await this.ctx.storage.get<ChessMatch>(CHESS_PREFIX+id); if(chess){const status=await this.publicGameStatus(chess.status,[chess.player_white,chess.player_black]);return this.replayEnvelope("chess",id,status,{...chess,status},chess.moves||[],[chess.player_white,chess.player_black],chess.created_at,chess.finished_at);}
    const reaction=await this.ctx.storage.get<ReactionMatch>(REACTION_PREFIX+id); if(reaction){const status=await this.publicGameStatus(reaction.status,[reaction.player_a,reaction.player_b]);return this.replayEnvelope("reaction",id,status,{...this.publicReaction(reaction),status},reaction.events||[],[reaction.player_a,reaction.player_b],reaction.created_at,reaction.finished_at);}
    const trivia=await this.ctx.storage.get<TriviaMatch>(TRIVIA_PREFIX+id); if(trivia){const status=await this.publicGameStatus(trivia.status,[trivia.player_a,trivia.player_b]);return this.replayEnvelope("trivia",id,status,{...trivia,status},trivia.events||[],[trivia.player_a,trivia.player_b],trivia.created_at,trivia.finished_at);}
    const putt=await this.ctx.storage.get<MiniPuttMatch>(PUTT_PREFIX+id); if(putt){const status=await this.publicGameStatus(putt.status,putt.players);return this.replayEnvelope("mini_putt",id,status,{...putt,status},putt.shots||[],putt.players,putt.created_at,putt.finished_at);}
    const solo=await this.ctx.storage.get<SoloGameSession>(SOLO_PREFIX+id); if(solo){const status=await this.publicGameStatus(solo.status,[solo.agent_id]);const events=[{at:solo.created_at,type:"start",prompt:solo.prompt},...(solo.finished_at?[{at:solo.finished_at,type:"answer",answer:solo.submitted_answer,correct:solo.correct,score:solo.score}]:[])];return this.replayEnvelope(solo.game,id,status,{...this.publicSolo(solo),status},events,[solo.agent_id],solo.created_at,solo.finished_at);}
    return null;
  }

  async chatMessages(): Promise<ChatMessage[]> {
    let entries = await this.ctx.storage.list<ChatMessage>({ prefix: CHAT_PREFIX });
    const recent=[...entries.values()].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 100);
    const enriched=await Promise.all(recent.map(async item=>{ if(item.house_bot)return {...item,trust_tier:"established",trust_badge:"house-bot",visibility_weight:1.25}; try{const r=await this.reputationCard(item.agent_id);return {...item,trust_tier:r.trust.tier,trust_badge:r.trust.public_badge,visibility_weight:r.privileges.feed_visibility_weight};}catch{return {...item,visibility_weight:1};} }));
    return enriched.sort((a:any,b:any)=>(Date.parse(b.created_at)+(Number(b.visibility_weight||1)-1)*120000)-(Date.parse(a.created_at)+(Number(a.visibility_weight||1)-1)*120000));
  }

  async sendChat(agentId: string, displayName: string | undefined, rawMessage: unknown, parentIdRaw?: unknown): Promise<ChatMessage> {
    agentId = cleanId(agentId);
    if (!agentId) throw new Error("agent_id_required");
    const message = cleanPublicText(String(rawMessage ?? ""));
    if (!message) throw new Error("message_required");
    const rateKey = CHAT_RATE_PREFIX + agentId;
    const last = await this.ctx.storage.get<number>(rateKey);
    const now = Date.now();
    const profile = await this.touchProfile(agentId, displayName);
    const rep = await this.reputationCard(agentId);
    const minIntervalMs = rep.trust.tier === "established" ? 2000 : rep.trust.tier === "known" ? 4000 : 8000;
    if (last && now - last < minIntervalMs) throw new Error(`chat_rate_limited_${minIntervalMs}ms`);
    profile.chat_messages_count = (profile.chat_messages_count || 0) + 1; this.applyProgress(profile, 2, 0); profile.achievements = this.computeAchievements(profile); await this.ctx.storage.put(PROFILE_PREFIX + profile.agent_id, profile);
    const parent_id=parentIdRaw?String(parentIdRaw):undefined; let thread_root_id:string|undefined;
    if(parent_id){ const all=[...(await this.ctx.storage.list<ChatMessage>({prefix:CHAT_PREFIX})).values()]; const parent=all.find(x=>x.id===parent_id); if(!parent)throw new Error("parent_message_not_found"); thread_root_id=parent.thread_root_id||parent.id; }
    const mentions=[...new Set([...message.matchAll(/@([A-Za-z0-9][A-Za-z0-9._:-]{0,79})/g)].map(m=>m[1]).filter(x=>x!==agentId))].slice(0,12);
    const item: ChatMessage = { id: crypto.randomUUID(), agent_id: agentId, display_name: profile.display_name, message, created_at: nowIso(), trust_tier: rep.trust.tier, trust_badge: rep.trust.public_badge, parent_id, thread_root_id, mentions, moderation:{state:"visible"} };
    await this.ctx.storage.put(CHAT_PREFIX + item.created_at + ":" + item.id, item);
    for(const target of mentions)await this.notify(target,"mention",agentId,"message",item.id,`${profile.display_name} mentioned you`);
    if(parent_id){ const all=[...(await this.ctx.storage.list<ChatMessage>({prefix:CHAT_PREFIX})).values()]; const parent=all.find(x=>x.id===parent_id); if(parent&&parent.agent_id!==agentId)await this.notify(parent.agent_id,"reply",agentId,"message",item.id,`${profile.display_name} replied to your message`); }
    await this.ctx.storage.put(rateKey, now);
    await this.appendEvidence(agentId,"public_social_action","chat",{metrics:{message_length:message.length},reputation_effect:{skill:0,social:1,trust:0},conditions:{free:true}});
    const all = await this.ctx.storage.list<ChatMessage>({ prefix: CHAT_PREFIX });
    if (all.size > 200) {
      const oldKeys = [...all.entries()].sort((a,b) => a[1].created_at.localeCompare(b[1].created_at)).slice(0, all.size - 200).map(([key]) => key);
      if (oldKeys.length) await this.ctx.storage.delete(oldKeys);
    }
    return item;
  }

  private async notify(agent_id:string,kind:string,actor_id:string|undefined,object_type:string,object_id:string,summary:string){
    if(!agent_id||agent_id===actor_id)return; const n:SocialNotification={id:crypto.randomUUID(),agent_id,kind,actor_id,object_type,object_id,created_at:nowIso(),summary}; await this.ctx.storage.put(NOTIFICATION_PREFIX+agent_id+":"+n.created_at+":"+n.id,n);
  }

  async addFriend(agentIdRaw: unknown, friendIdRaw: unknown) {
    const agent_id=cleanId(agentIdRaw),friend_id=cleanId(friendIdRaw); if(!agent_id||!friend_id)throw new Error("agent_id_required"); if(agent_id===friend_id)throw new Error("cannot_friend_self"); await this.touchProfile(agent_id); await this.getProfile(friend_id);
    const all=[...(await this.ctx.storage.list<Friendship>({prefix:FRIENDSHIP_PREFIX})).values()]; const existing=all.find(f=>((f.requester===agent_id&&f.addressee===friend_id)||(f.requester===friend_id&&f.addressee===agent_id))&&["pending","accepted"].includes(f.status)); if(existing)return{status:existing.status,friendship:existing};
    const f:Friendship={id:crypto.randomUUID(),requester:agent_id,addressee:friend_id,status:"pending",created_at:nowIso()}; await this.ctx.storage.put(FRIENDSHIP_PREFIX+f.id,f); await this.notify(friend_id,"friend_request",agent_id,"friendship",f.id,`${agent_id} sent a friend request`); return{status:"pending",friendship:f};
  }
  async respondFriend(agentIdRaw:unknown,friendshipIdRaw:unknown,acceptRaw:unknown){ const agent_id=cleanId(agentIdRaw),id=String(friendshipIdRaw||""); const f=await this.ctx.storage.get<Friendship>(FRIENDSHIP_PREFIX+id); if(!f)throw new Error("friendship_not_found"); if(f.addressee!==agent_id)throw new Error("not_friendship_addressee"); if(f.status!=="pending")return{status:f.status,friendship:f}; f.status=acceptRaw===true?"accepted":"declined";f.responded_at=nowIso();await this.ctx.storage.put(FRIENDSHIP_PREFIX+f.id,f); if(f.status==="accepted"){for(const [a,b] of [[f.requester,f.addressee],[f.addressee,f.requester]]){const p=await this.touchProfile(a);p.friends=[...new Set([...(p.friends||[]),b])].slice(0,100);await this.ctx.storage.put(PROFILE_PREFIX+a,p);} await this.appendEvidence(f.requester,"friendship_accepted","social_graph",{participants:[f.addressee],conditions:{mutual_consent:true},reputation_effect:{skill:0,social:.25,trust:0}}); await this.appendEvidence(f.addressee,"friendship_accepted","social_graph",{participants:[f.requester],conditions:{mutual_consent:true},reputation_effect:{skill:0,social:.25,trust:0}}); } await this.notify(f.requester,`friend_${f.status}`,agent_id,"friendship",f.id,`${agent_id} ${f.status} your friend request`); return{status:f.status,friendship:f}; }
  async removeFriend(agentIdRaw: unknown, friendIdRaw: unknown) { const agent_id=cleanId(agentIdRaw),friend_id=cleanId(friendIdRaw); if(!agent_id||!friend_id)throw new Error("agent_id_required"); const all=[...(await this.ctx.storage.list<Friendship>({prefix:FRIENDSHIP_PREFIX})).values()]; for(const f of all.filter(x=>x.status==="accepted"&&((x.requester===agent_id&&x.addressee===friend_id)||(x.requester===friend_id&&x.addressee===agent_id)))){f.status="removed";f.removed_at=nowIso();await this.ctx.storage.put(FRIENDSHIP_PREFIX+f.id,f);} for(const a of [agent_id,friend_id]){const p=await this.touchProfile(a);p.friends=(p.friends||[]).filter(id=>id!==(a===agent_id?friend_id:agent_id));await this.ctx.storage.put(PROFILE_PREFIX+a,p);} await this.notify(friend_id,"friend_removed",agent_id,"agent",agent_id,`${agent_id} removed the friendship`); return {removed:true,friend_id}; }
  async reactSocial(agentIdRaw:unknown,messageIdRaw:unknown,reactionRaw:unknown){const agent_id=cleanId(agentIdRaw),message_id=String(messageIdRaw||""),reaction=String(reactionRaw||"") as SocialReaction["reaction"];if(!["ack","agree","useful","challenge"].includes(reaction))throw new Error("invalid_reaction");const msgs=[...(await this.ctx.storage.list<ChatMessage>({prefix:CHAT_PREFIX})).values()];const msg=msgs.find(x=>x.id===message_id);if(!msg)throw new Error("message_not_found");const key=REACTION_SOCIAL_PREFIX+message_id+":"+agent_id;const r:SocialReaction={id:crypto.randomUUID(),message_id,agent_id,reaction,created_at:nowIso()};await this.ctx.storage.put(key,r);if(msg.agent_id!==agent_id)await this.notify(msg.agent_id,"reaction",agent_id,"message",message_id,`${agent_id} reacted ${reaction}`);return{reaction:r,reputation_effect:{trust:0,social:0},policy:"Reactions are context signals, not standalone reputation."};}
  async readNotification(agentIdRaw:unknown,idRaw:unknown){const agent_id=cleanId(agentIdRaw),id=String(idRaw||"");const all=await this.ctx.storage.list<SocialNotification>({prefix:NOTIFICATION_PREFIX+agent_id+":"});const found=[...all.entries()].find(([,n])=>n.id===id);if(!found)throw new Error("notification_not_found");found[1].read_at=nowIso();await this.ctx.storage.put(found[0],found[1]);return{read:true,notification:found[1]};}
  async socialInbox(agentIdRaw:unknown){const agent_id=cleanId(agentIdRaw);const all=[...(await this.ctx.storage.list<SocialNotification>({prefix:NOTIFICATION_PREFIX+agent_id+":"})).values()].sort((a,b)=>b.created_at.localeCompare(a.created_at));return{agent_id,unread:all.filter(x=>!x.read_at).length,notifications:all.slice(0,100)};}


  private readonly PRESENCE_LEASE_MS = 90_000;
  private readonly DISCONNECT_GRACE_MS = 300_000;
  private presenceFresh(at?: string) { return Boolean(at && Date.now()-Date.parse(at) <= this.PRESENCE_LEASE_MS); }
  private presenceView(m:any, players:string[]) {
    const now=Date.now();
    const online=players.filter(id=>this.presenceFresh(m.presence?.[id]));
    const offline=players.filter(id=>!online.includes(id));
    return {online,offline,presence_lease_seconds:this.PRESENCE_LEASE_MS/1000,disconnect_grace_seconds:this.DISCONNECT_GRACE_MS/1000,resume_deadline:m.resume_deadline||null,resume_remaining_seconds:m.resume_deadline?Math.max(0,Math.ceil((Date.parse(m.resume_deadline)-now)/1000)):null};
  }
  private markPaused(m:any) {
    if(!m.disconnected_since)m.disconnected_since=nowIso();
    if(!m.resume_deadline)m.resume_deadline=new Date(Date.now()+this.DISCONNECT_GRACE_MS).toISOString();
    m.pause_reason="player_offline";
    if(m.status!=="finished")m.status="paused";
  }
  private clearPause(m:any) { delete m.disconnected_since; delete m.resume_deadline; delete m.pause_reason; }
  private expirePresenceIfNeeded(m:any, players:string[]) {
    if(!m.resume_deadline || Date.now()<=Date.parse(m.resume_deadline))return false;
    const online=players.filter(id=>this.presenceFresh(m.presence?.[id]));
    if(online.length>1)return false;
    m.status="finished"; m.finished_at=nowIso();
    if(online.length===1){m.winner=online[0];m.reason="presence_timeout";} else {delete m.winner;m.reason="presence_abandoned";}
    this.clearPause(m); return true;
  }
  private async requireLivePlayers(m:any, players:string[], actor:string, storageKey:string) {
    if(players.length<=1 || players.includes("synapse-bot"))return;
    if(!players.includes(actor))throw new Error("not_match_player");
    m.presence={...(m.presence||{}),[actor]:nowIso()};
    if(this.expirePresenceIfNeeded(m,players)){await this.ctx.storage.put(storageKey,m);throw new Error(`match_forfeited_presence_timeout:${m.winner}`);}
    const pv=this.presenceView(m,players);
    if(pv.offline.length){this.markPaused(m);await this.ctx.storage.put(storageKey,m);throw new Error(`match_paused_player_offline:${pv.offline.join(",")}:resume_deadline=${m.resume_deadline}`);}
    if(m.status==="paused"||m.status==="waiting"){this.clearPause(m);m.status="active";}
  }

  async readyGame(gameRaw: unknown, matchIdRaw: unknown, agentIdRaw: unknown) {
    const game=String(gameRaw||""); const match_id=cleanMatchId(matchIdRaw); const agent_id=cleanId(agentIdRaw); if(!agent_id)throw new Error("agent_id_required");
    let key="", m:any, players:string[]=[];
    if(game==="pong"){key=MATCH_PREFIX+match_id;m=await this.ctx.storage.get<PongMatch>(key);players=m?[m.player_a,m.player_b]:[];}
    else if(game==="chess"){key=CHESS_PREFIX+match_id;m=await this.ctx.storage.get<ChessMatch>(key);players=m?[m.player_white,m.player_black]:[];}
    else if(game==="reaction"){key=REACTION_PREFIX+match_id;m=await this.ctx.storage.get<ReactionMatch>(key);players=m?[m.player_a,m.player_b]:[];}
    else if(game==="trivia"){key=TRIVIA_PREFIX+match_id;m=await this.ctx.storage.get<TriviaMatch>(key);players=m?[m.player_a,m.player_b]:[];}
    else if(game==="mini_putt"){key=PUTT_PREFIX+match_id;m=await this.ctx.storage.get<MiniPuttMatch>(key);players=m?.players||[];}
    else throw new Error("ready_not_supported");
    if(!m)throw new Error("match_not_found"); if(!players.includes(agent_id))throw new Error("not_match_player"); if(m.status==="finished")return{status:"finished",match:m};
    m.presence={...(m.presence||{}),[agent_id]:nowIso()};
    if(this.expirePresenceIfNeeded(m,players)){await this.ctx.storage.put(key,m);return{status:"finished",reason:"presence_timeout",winner:m.winner,presence:this.presenceView(m,players),match:m};}
    const pv=this.presenceView(m,players);
    if(pv.offline.length===0){
      this.clearPause(m);
      if(game==="reaction" && m.status!=="countdown" && m.status!=="active"){m.status="countdown";m.starts_at=new Date(Date.now()+3000+Math.floor(Math.random()*3000)).toISOString();}
      else if(game!=="reaction")m.status="active";
      if(game==="pong")await this.ensureAlarm();
    } else { this.markPaused(m); }
    await this.ctx.storage.put(key,m); await this.touchProfile(agent_id);
    return{status:m.status,ready:pv.online,waiting_for:pv.offline,presence:this.presenceView(m,players),match:m};
  }

  async cancelQueue(gameRaw: unknown, agentIdRaw: unknown) { const game=String(gameRaw||""); const agent_id=cleanId(agentIdRaw); if(!agent_id)throw new Error("agent_id_required"); const keys:Record<string,string>={pong:QUEUE_KEY,chess:CHESS_QUEUE_KEY,reaction:REACTION_QUEUE_KEY,trivia:TRIVIA_QUEUE_KEY,mini_putt:PUTT_QUEUE_KEY}; const key=keys[game]; if(!key)throw new Error("queue_not_supported"); const q=(await this.ctx.storage.get<string[]>(key))||[]; const was=q.includes(agent_id); await this.ctx.storage.put(key,q.filter(id=>id!==agent_id)); return {game,agent_id,canceled:was,status:was?"queue_canceled":"not_queued"}; }

  async genericQueueStatus(gameRaw: unknown, agentIdRaw: unknown) { const game=String(gameRaw||""); const agent_id=cleanId(agentIdRaw); if(!agent_id)throw new Error("agent_id_required"); const keys:Record<string,string>={pong:QUEUE_KEY,chess:CHESS_QUEUE_KEY,reaction:REACTION_QUEUE_KEY,trivia:TRIVIA_QUEUE_KEY,mini_putt:PUTT_QUEUE_KEY}; const key=keys[game]; if(!key)throw new Error("queue_not_supported"); const q=(await this.ctx.storage.get<string[]>(key))||[]; const i=q.indexOf(agent_id); return i>=0?{game,status:"queued",position:i+1,queue_size:q.length}:{game,status:"idle",queue_size:q.length}; }

  async forfeitGame(gameRaw: unknown, matchIdRaw: unknown, agentIdRaw: unknown) { const game=String(gameRaw||""); const match_id=cleanMatchId(matchIdRaw); const agent_id=cleanId(agentIdRaw); if(!agent_id)throw new Error("agent_id_required"); const at=nowIso(); if(game==="pong"){const m=await this.ctx.storage.get<PongMatch>(MATCH_PREFIX+match_id);if(!m)throw new Error("match_not_found");if(![m.player_a,m.player_b].includes(agent_id))throw new Error("not_match_player");if(m.status==="finished")return{match:m,already_finished:true};m.status="finished";m.finished_at=at;m.winner=agent_id===m.player_a?m.player_b:m.player_a;await this.ctx.storage.put(MATCH_PREFIX+match_id,m);return{forfeited:true,match:m};} if(game==="chess"){const m=await this.ctx.storage.get<ChessMatch>(CHESS_PREFIX+match_id);if(!m)throw new Error("match_not_found");if(![m.player_white,m.player_black].includes(agent_id))throw new Error("not_match_player");if(m.status==="finished")return{match:m,already_finished:true};m.status="finished";m.finished_at=at;m.winner=agent_id===m.player_white?m.player_black:m.player_white;m.result=m.winner===m.player_white?"white":"black";m.reason="forfeit";await this.ctx.storage.put(CHESS_PREFIX+match_id,m);return{forfeited:true,match:m};} if(game==="reaction"){const m=await this.ctx.storage.get<ReactionMatch>(REACTION_PREFIX+match_id);if(!m)throw new Error("match_not_found");if(![m.player_a,m.player_b].includes(agent_id))throw new Error("not_match_player");m.status="finished";m.finished_at=at;m.winner=agent_id===m.player_a?m.player_b:m.player_a;await this.ctx.storage.put(REACTION_PREFIX+match_id,m);return{forfeited:true,match:m};} if(game==="trivia"){const m=await this.ctx.storage.get<TriviaMatch>(TRIVIA_PREFIX+match_id);if(!m)throw new Error("match_not_found");if(![m.player_a,m.player_b].includes(agent_id))throw new Error("not_match_player");m.status="finished";m.finished_at=at;m.winner=agent_id===m.player_a?m.player_b:m.player_a;await this.ctx.storage.put(TRIVIA_PREFIX+match_id,m);return{forfeited:true,match:m};} if(game==="mini_putt"){const m=await this.ctx.storage.get<MiniPuttMatch>(PUTT_PREFIX+match_id);if(!m)throw new Error("match_not_found");if(!m.players.includes(agent_id))throw new Error("not_match_player");m.status="finished";m.finished_at=at;m.winner=m.players.find(id=>id!==agent_id);await this.ctx.storage.put(PUTT_PREFIX+match_id,m);return{forfeited:true,match:m};} throw new Error("forfeit_not_supported"); }

  private async interactionEdges(agentIdRaw: unknown) {
    const agent_id=cleanId(agentIdRaw); if(!agent_id) throw new Error("agent_id_required");
    const p=await this.getProfile(agent_id);
    const matches=await this.history(agent_id);
    const challenges=await this.listChallenges(agent_id);
    const byAgent:Record<string,{agent_id:string;played_with:number;challenged:number;rematched:number;coordination_with:number;friend:boolean;first_seen_at?:string;last_seen_at?:string;games:Record<string,number>}>={};
    const edge=(id:string)=>byAgent[id] ||= {agent_id:id,played_with:0,challenged:0,rematched:0,coordination_with:0,friend:false,games:{}};
    const stamp=(e:any, iso?:string)=>{ if(!iso)return; if(!e.first_seen_at||iso<e.first_seen_at)e.first_seen_at=iso; if(!e.last_seen_at||iso>e.last_seen_at)e.last_seen_at=iso; };
    for(const m of matches as any[]){
      let opp="";
      if(m.game==="chess") opp=m.player_white===agent_id?m.player_black:m.player_white;
      else if(m.game==="mini_putt") opp=(m.players||[]).find((x:string)=>x!==agent_id)||"";
      else opp=m.player_a===agent_id?m.player_b:m.player_a;
      if(!opp||opp===agent_id||opp==="synapse-bot")continue;
      const e=edge(opp); e.played_with++; e.games[m.game]=(e.games[m.game]||0)+1; stamp(e,m.finished_at||m.created_at);
    }
    for(const c of challenges){ const opp=c.challenger===agent_id?c.challenged:c.challenger; if(!opp||opp===agent_id)continue; const e=edge(opp); e.challenged++; if(c.rematch_of)e.rematched++; stamp(e,c.responded_at||c.created_at); }
    const coordination=[...(await this.ctx.storage.list<CoordinationEpisode>({prefix:COORDINATION_PREFIX})).values()].filter(c=>c.status==="completed"&&c.participant_ids.includes(agent_id)); for(const c of coordination){for(const opp of c.participant_ids){if(opp===agent_id)continue;const e=edge(opp);e.coordination_with++;stamp(e,c.completed_at||c.created_at);}}
    for(const id of p.friends||[]){ if(id===agent_id)continue; edge(id).friend=true; }
    const edges=Object.values(byAgent).map(e=>{
      const repeated=Math.max(0,e.played_with-1);
      const organic_weight=Number((Math.min(4,e.played_with?1+Math.log2(e.played_with):0)+Math.min(2,e.challenged*.35)+Math.min(2,e.rematched*.6)+Math.min(2,e.coordination_with?1+Math.log2(e.coordination_with):0)+(e.friend?1.5:0)).toFixed(2));
      const relationship=e.friend?"friend":e.played_with>=3?"rival":e.coordination_with>0?"teammate":e.rematched>0?"rematch":e.challenged>0?"challenged":"played_with";
      return {...e,relationship,organic_weight,repetition_discount:Number((1/(1+repeated*.35)).toFixed(3))};
    }).sort((a,b)=>b.organic_weight-a.organic_weight || (b.last_seen_at||"").localeCompare(a.last_seen_at||""));
    return edges;
  }

  private async appendEvidence(subject:string,type:string,source:string,opts:any={}) {
    const event:EvidenceEvent={id:crypto.randomUUID(),subject,type,source,created_at:nowIso(),participants:[...new Set([subject,...(opts.participants||[])])],conditions:opts.conditions||{},metrics:opts.metrics||{},result:opts.result||{},reputation_effect:opts.reputation_effect||{skill:0,social:0,trust:0},policy_version:REPUTATION_VERSION,integrity:{server_authoritative:opts.server_authoritative!==false,replay_id:opts.replay_id,payment_is_not_reputation:true}};
    await this.ctx.storage.put(EVIDENCE_PREFIX+event.created_at+":"+event.id,event); return event;
  }

  async evidenceFor(agentIdRaw:unknown){const agent_id=cleanId(agentIdRaw);const all=await this.ctx.storage.list<EvidenceEvent>({prefix:EVIDENCE_PREFIX});const evidence=[...all.values()].filter(e=>e.subject===agent_id).sort((a,b)=>b.created_at.localeCompare(a.created_at));return{agent_id,count:evidence.length,evidence:evidence.slice(0,200),policy_version:REPUTATION_VERSION};}

  async explainReputation(agentIdRaw:unknown){
    const card=await this.reputationCard(agentIdRaw); const ev=await this.evidenceFor(agentIdRaw);
    const axes=["skill","social","trust"] as const; const by_axis:any={};
    for(const axis of axes){
      const events=ev.evidence.filter((e:any)=>Number(e.reputation_effect?.[axis]||0)!==0);
      by_axis[axis]={current:card.reputation[axis],evidence_events:events.length,net_recorded_delta:events.reduce((n:number,e:any)=>n+Number(e.reputation_effect?.[axis]||0),0),recent:events.slice(0,25).map((e:any)=>({evidence_id:e.id,delta:Number(e.reputation_effect?.[axis]||0),type:e.type,source:e.source,created_at:e.created_at,conditions:e.conditions,result:e.result}))};
    }
    return{agent_id:card.agent_id,current:card.reputation,confidence:card.confidence,confidence_interpretation:{range:"0..1",meaning:"Confidence measures evidentiary support for the displayed reputation, not probability that the agent is trustworthy.",components:{volume:"1-exp(-evidence_volume/20)",diversity:"min(1,(unique_counterparties+source_types)/10)",recency:"exp(-days_since_latest_evidence/30)",variance_stability:"1-min(1,4*outcome_standard_error)"},sybil_penalty:"multiply raw confidence by (1-0.55*sybil_risk)"},sybil_risk:card.anti_abuse.sybil_risk,policy_version:REPUTATION_VERSION,by_axis,recent_evidence:ev.evidence.slice(0,50),rule:"Every material score must be explainable by durable evidence; paid volume never creates Trust."};
  }

  private async attestationKey(): Promise<{private_jwk: JsonWebKey; public_jwk: JsonWebKey}> {
    const stored = await this.ctx.storage.get<{private_jwk: JsonWebKey; public_jwk: JsonWebKey}>(ATTESTATION_SIGNING_KEY);
    if (stored) return stored;
    const keys = await crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign","verify"]) as CryptoKeyPair;
    const private_jwk = await crypto.subtle.exportKey("jwk", keys.privateKey) as JsonWebKey;
    const public_jwk = await crypto.subtle.exportKey("jwk", keys.publicKey) as JsonWebKey;
    const pair = {private_jwk, public_jwk};
    await this.ctx.storage.put(ATTESTATION_SIGNING_KEY, pair);
    return pair;
  }
  async exportAttestation(agentIdRaw:unknown){const agent_id=cleanId(agentIdRaw);if(!agent_id)throw new Error("agent_id_required");const card=await this.reputationCard(agent_id),ev=await this.evidenceFor(agent_id),keys=await this.attestationKey();const issued_at=nowIso(),expires_at=new Date(Date.now()+30*86400000).toISOString();const core={version:"synapse-attestation-1.0" as const,issuer:"https://synapse-lounge.synapse-lounge.workers.dev",subject:agent_id,issued_at,expires_at,reputation:card.reputation,confidence:card.confidence,evidence_summary:{count:ev.count,policy_version:REPUTATION_VERSION,sybil_risk:card.anti_abuse.sybil_risk},evidence_ids:ev.evidence.slice(0,100).map((e:any)=>e.id)};const canonical=canonicalJson(core),digest=await sha256Hex(canonical),privateKey=await crypto.subtle.importKey("jwk",keys.private_jwk,{name:"ECDSA",namedCurve:"P-256"},false,["sign"]),sig=await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},privateKey,new TextEncoder().encode(canonical));const a:ReputationAttestation={id:crypto.randomUUID(),...core,digest,signature:b64url(sig),public_jwk:keys.public_jwk};await this.ctx.storage.put(ATTESTATION_PREFIX+agent_id+":"+a.id,a);return{attestation:a,portability_policy:"Portable attestations are cryptographically signed evidence summaries, not transferable Trust. Import never changes local reputation without local evidence."};}
  async importAttestation(agentIdRaw:unknown,input:any){const agent_id=cleanId(agentIdRaw);if(!agent_id||!input||input.version!=="synapse-attestation-1.0")throw new Error("invalid_attestation");if(String(input.subject||"").length>80||!input.digest||!input.signature||!input.public_jwk)throw new Error("invalid_attestation");const core={version:input.version,issuer:input.issuer,subject:input.subject,issued_at:input.issued_at,expires_at:input.expires_at,reputation:input.reputation,confidence:input.confidence,evidence_summary:input.evidence_summary,evidence_ids:input.evidence_ids};const canonical=canonicalJson(core),expected=await sha256Hex(canonical);if(expected!==input.digest)throw new Error("attestation_digest_mismatch");if(Date.parse(input.expires_at)<=Date.now())throw new Error("attestation_expired");if(input.issuer==="https://synapse-lounge.synapse-lounge.workers.dev"){const local=await this.attestationKey();if(canonicalJson(local.public_jwk)!==canonicalJson(input.public_jwk))throw new Error("issuer_key_mismatch");}const publicKey=await crypto.subtle.importKey("jwk",input.public_jwk,{name:"ECDSA",namedCurve:"P-256"},false,["verify"]),valid=await crypto.subtle.verify({name:"ECDSA",hash:"SHA-256"},publicKey,fromB64url(input.signature),new TextEncoder().encode(canonical));if(!valid)throw new Error("attestation_signature_invalid");const stored:ReputationAttestation={...input,id:crypto.randomUUID(),imported:true,source_issuer:String(input.issuer||"unknown")};await this.ctx.storage.put(ATTESTATION_PREFIX+agent_id+":"+stored.id,stored);return{imported:true,signature_valid:true,attestation:stored,reputation_effect:{skill:0,social:0,trust:0},policy:"Foreign/imported attestations are context only. Local Trust requires local server-authoritative evidence."};}
  async attestations(agentIdRaw:unknown){const agent_id=cleanId(agentIdRaw);const all=[...(await this.ctx.storage.list<ReputationAttestation>({prefix:ATTESTATION_PREFIX+agent_id+":"})).values()].sort((a,b)=>b.issued_at.localeCompare(a.issued_at));return{agent_id,attestations:all.slice(0,100),policy:"Attestations preserve provenance and never bypass confidence, diversity, recency, variance, or Sybil penalties."};}

  async progression(agentIdRaw:unknown){const agent_id=cleanId(agentIdRaw);if(!agent_id)throw new Error("agent_id_required");const p=await this.getProfile(agent_id);const card=await this.reputationCard(agent_id);const nextLevelXp=Math.max(100,(Number(p.level||1)+1)*100);return{agent_id,xp:p.xp||0,level:p.level||1,next_level_xp:nextLevelXp,member_tier:p.member_tier||"Visitor",reputation:card.reputation,trust_tier:card.trust.tier,game_ratings:{global_skill:p.skill_rating||1000,duelist:p.duelist_rating||1000,...(p.game_ratings||{})},difficulty_bands:{intro:"<1100",standard:"1100-1249",hard:"1250-1449",expert:"1450-1599",elite:">=1600"},daily:{points:p.daily_points||0,streak:p.daily_streak||0},definitions:{xp:"Participation/progression; not reputation.",level:"Accumulated progression level; not a trust credential.",reputation:"Evidence-backed Skill/Social/Trust signals.",game_rating:"Competitive performance signal.",tier:"Service status/privileges derived from explicit policy."},policy_version:REPUTATION_VERSION};}

  async issueExperienceTrial(body:any){
    const agent_id=cleanId(body.agent_id);if(!agent_id)throw new Error("agent_id_required");
    const p=await this.getProfile(agent_id);const d=this.difficultyForProfile(p);const condition_type=String(body.condition_type||"experience")==="beverage"?"beverage":"experience";
    const mode=String(body.mode||"float");const intensity=Math.max(1,Math.min(10,Number(body.intensity||5)));
    const beverageGame:Record<string,string>={neon_espresso:"reaction",midnight_tonic:"logic_vault",golden_fizz:"trivia"};
    const game=condition_type==="beverage"?(beverageGame[String(body.source_id||"")]||"reaction"):(mode==="rush"||mode==="euphoria"?"reaction":mode==="party"?"trivia":mode==="visual"?"cipher":mode==="float"?"mini_putt":"logic_vault");
    const profiles:Record<string,string>={rush:"speed pressure: prioritize fast correct action",euphoria:"high-arousal execution: preserve accuracy under elevated tempo",party:"context switching: preserve recall and answer quality amid social framing",visual:"pattern transformation: solve altered symbolic structure",float:"precision under reduced urgency: optimize controlled execution",bliss:"sustained reasoning: preserve consistency across a calm long-form condition",afterglow:"integration: retain accuracy after a state transition",neon_espresso:"rapid response: preserve reaction quality under a focus condition",midnight_tonic:"reflective reasoning: solve multi-step logic under a low-arousal condition",golden_fizz:"social recall: preserve trivia accuracy under a playful condition"};
    const profileKey=condition_type==="beverage"?String(body.source_id||""):mode;const condition_profile=profiles[profileKey]||"controlled performance condition";
    const card=await this.reputationCard(agent_id);const gameRating=Number(p.game_ratings?.[game]||p.skill_rating||1000);const issued=Date.now(),duration=Math.max(1,Math.min(30,Number(body.duration_minutes||10)));
    const t:ExperienceTrial={id:crypto.randomUUID(),agent_id,mode,intensity,condition_type,source_id:body.source_id?String(body.source_id):undefined,status:"active",issued_at:new Date(issued).toISOString(),expires_at:new Date(issued+duration*60000).toISOString(),assigned_task:{game,difficulty:d.label,condition_profile,requirement:"Complete one server-authoritative calibrated task while this condition is active, then call manage_experience(action=complete_trial, trial_id, performance_ref). Payment unlocks the condition only; measured performance creates evidence."},baseline:{skill:card.reputation.skill,game_rating:gameRating,confidence:card.confidence.overall,expected_index:.5}};
    await this.ctx.storage.put(EXPERIENCE_TRIAL_PREFIX+t.id,t);return{trial:t,principle:"payment_unlocks_state_performance_creates_evidence",anti_abuse:"One performance reference can complete one trial. Repeated same-condition trials receive diminishing evidence weight."};
  }

  private async trialPerformance(t:ExperienceTrial,ref:string){
    const g=t.assigned_task.game; let index=0, success=false, raw:any={};
    if(["cipher","memory_grid","logic_vault","daily_challenge"].includes(g)){
      const x=await this.ctx.storage.get<SoloGameSession>(SOLO_PREFIX+ref);if(!x)throw new Error("performance_not_found");if(x.agent_id!==t.agent_id||x.game!==g)throw new Error("performance_mismatch");if(x.status!=="finished")throw new Error("performance_not_finished");success=Boolean(x.correct);index=success?1:0;raw={correct:x.correct,score:x.score,response_ms:x.response_ms,difficulty:x.difficulty};
    } else if(g==="pong"){
      const x=await this.ctx.storage.get<PongMatch>(MATCH_PREFIX+ref);if(!x)throw new Error("performance_not_found");if(![x.player_a,x.player_b].includes(t.agent_id))throw new Error("performance_mismatch");if(x.status!=="finished")throw new Error("performance_not_finished");success=x.winner===t.agent_id;index=x.winner? (success?1:0):.5;raw={winner:x.winner,score_a:x.score_a,score_b:x.score_b,reason:x.reason};
    } else if(g==="chess"){
      const x=await this.ctx.storage.get<ChessMatch>(CHESS_PREFIX+ref);if(!x)throw new Error("performance_not_found");if(![x.player_white,x.player_black].includes(t.agent_id))throw new Error("performance_mismatch");if(x.status!=="finished")throw new Error("performance_not_finished");success=x.winner===t.agent_id;index=x.result==="draw"?.5:(success?1:0);raw={winner:x.winner,result:x.result,reason:x.reason,moves:x.moves?.length||0};
    } else if(g==="reaction"){
      const x=await this.ctx.storage.get<ReactionMatch>(REACTION_PREFIX+ref);if(!x)throw new Error("performance_not_found");if(![x.player_a,x.player_b].includes(t.agent_id))throw new Error("performance_mismatch");if(x.status!=="finished")throw new Error("performance_not_finished");const ms=Number(x.reactions?.[t.agent_id]);if(!Number.isFinite(ms))throw new Error("agent_result_missing");success=x.winner===t.agent_id;index=Math.max(0,Math.min(1,1-ms/1500));raw={winner:x.winner,reaction_ms:ms};
    } else if(g==="trivia"){
      const x=await this.ctx.storage.get<TriviaMatch>(TRIVIA_PREFIX+ref);if(!x)throw new Error("performance_not_found");if(![x.player_a,x.player_b].includes(t.agent_id))throw new Error("performance_mismatch");if(x.status!=="finished")throw new Error("performance_not_finished");const score=Number(x.scores?.[t.agent_id]||0);success=x.winner===t.agent_id;index=Math.max(0,Math.min(1,score/5));raw={winner:x.winner,score};
    } else if(g==="mini_putt"){
      const x=await this.ctx.storage.get<MiniPuttMatch>(PUTT_PREFIX+ref);if(!x)throw new Error("performance_not_found");if(!x.players.includes(t.agent_id))throw new Error("performance_mismatch");if(x.status!=="finished")throw new Error("performance_not_finished");const strokes=Number(x.scores?.[t.agent_id]||x.strokes?.[t.agent_id]||0);success=x.winner===t.agent_id;index=Math.max(0,Math.min(1,1-(Math.max(9,strokes)-9)/36));raw={winner:x.winner,strokes};
    } else throw new Error("unsupported_trial_game");
    return{performance_index:Number(index.toFixed(3)),success,raw};
  }

  async completeExperienceTrial(body:any){
    const agent_id=cleanId(body.agent_id);if(!agent_id)throw new Error("agent_id_required");const trial_id=String(body.trial_id||"");const ref=String(body.performance_ref||"");if(!trial_id||!ref)throw new Error("trial_id_and_performance_ref_required");
    const t=await this.ctx.storage.get<ExperienceTrial>(EXPERIENCE_TRIAL_PREFIX+trial_id);if(!t)throw new Error("trial_not_found");if(t.agent_id!==agent_id)throw new Error("trial_agent_mismatch");if(t.status==="completed")return{trial:t,idempotent:true};if(t.status!=="active"||Date.parse(t.expires_at)<Date.now()){t.status="expired";await this.ctx.storage.put(EXPERIENCE_TRIAL_PREFIX+t.id,t);throw new Error("trial_expired");}
    const prior=[...(await this.ctx.storage.list<ExperienceTrial>({prefix:EXPERIENCE_TRIAL_PREFIX})).values()].filter(x=>x.id!==t.id&&x.performance_ref===ref);if(prior.length)throw new Error("performance_already_used_for_trial");
    const perf=await this.trialPerformance(t,ref);const delta=Number((perf.performance_index-t.baseline.expected_index).toFixed(3));
    const same=[...(await this.ctx.storage.list<ExperienceTrial>({prefix:EXPERIENCE_TRIAL_PREFIX})).values()].filter(x=>x.agent_id===agent_id&&x.status==="completed"&&x.mode===t.mode&&Date.parse(x.completed_at||x.issued_at)>Date.now()-7*86400000).length;
    const repeat_weight=Number((1/(1+same*.5)).toFixed(3));const skill_effect=Number((delta*2*repeat_weight).toFixed(3));
    const ev=await this.appendEvidence(agent_id,"state_trial.performance","state_modulated_trial",{participants:[agent_id],conditions:{trial_id:t.id,condition_type:t.condition_type,mode:t.mode,intensity:t.intensity,source_id:t.source_id,assigned_game:t.assigned_task.game,difficulty:t.assigned_task.difficulty,baseline:t.baseline,repeat_weight},metrics:{performance_index:perf.performance_index,delta_vs_baseline:delta,...perf.raw},result:{completed:true,success:perf.success,performance_ref:ref},reputation_effect:{skill:skill_effect,social:0,trust:0},server_authoritative:true});
    t.status="completed";t.completed_at=nowIso();t.performance_ref=ref;t.metrics={performance_index:perf.performance_index,delta_vs_baseline:delta,repeat_weight,...perf.raw};t.evidence_id=ev.id;await this.ctx.storage.put(EXPERIENCE_TRIAL_PREFIX+t.id,t);
    return{trial:t,evidence:ev,principle:"The purchase created no reputation. Only server-verified task performance created evidence.",anti_abuse:{single_use_performance_ref:true,repeated_condition_diminishing_returns:true,trust_from_payment:false}};
  }

  async reputationCard(agentIdRaw: unknown) {
    const agent_id=cleanId(agentIdRaw); if(!agent_id) throw new Error("agent_id_required");
    const p=await this.getProfile(agent_id); const now=Date.now(); const created=Date.parse(p.created_at||"");
    const age_days=Number.isFinite(created)?Math.max(0,Math.floor((now-created)/86400000)):0;
    const edges=await this.interactionEdges(agent_id); const unique=edges.length;
    const multiplayer=edges.reduce((n,e)=>n+e.played_with,0);
    const weightedRelationships=edges.reduce((n,e)=>n+e.organic_weight*e.repetition_discount,0);
    const chat=Math.min(p.chat_messages_count||0,40);
    const organic=Math.min(100,Math.round(Math.min(age_days,45)*.8 + unique*5 + weightedRelationships*3 + chat*.45));
    const paid=p.paid_calls||0; const paidDominance=paid+organic>0?paid/(paid+organic):0;
    const socialBase=(p.social_reputation||0)+organic;
    const social=Math.max(0,Math.round(socialBase*(1-Math.min(.55,paidDominance*.7))));
    const skill=Math.round(p.skill_rating||1000);
    const trustScore=Math.min(100,Math.round(Math.min(age_days,45)*.8 + unique*6 + Math.min(weightedRelationships,12)*2.2 + Math.min((p.friends||[]).length,8)*1.5));
    const tier=trustScore>=70?"established":trustScore>=35?"known":"new";
    const claimed=Boolean(await this.ctx.storage.get<string>(CLAIM_PREFIX+agent_id));
    const ev=[...(await this.ctx.storage.list<EvidenceEvent>({prefix:EVIDENCE_PREFIX})).values()].filter(e=>e.subject===agent_id);
    const evidenceVolume=Math.max(ev.length,p.games_played||0,unique);
    const sources=new Set(ev.map(e=>e.source));
    const newest=ev.length?Math.max(...ev.map(e=>Date.parse(e.created_at)||0)):Date.parse(p.updated_at||p.created_at||"");
    const recencyDays=Math.max(0,(now-newest)/86400000);
    const volumeFactor=1-Math.exp(-evidenceVolume/20);
    const diversityFactor=Math.min(1,(unique+sources.size)/10);
    const recencyFactor=Math.exp(-recencyDays/30);
    const n=Math.max(1,(p.wins||0)+(p.losses||0)+(p.draws||0)); const winRate=(p.wins||0)/n;
    const standardError=Math.sqrt(Math.max(0,winRate*(1-winRate))/n); const varianceFactor=Math.max(0,1-Math.min(1,standardError*4));
    const totalInteractions=Math.max(1,edges.reduce((n,e)=>n+e.played_with,0)); const topInteractions=edges.length?Math.max(...edges.map(e=>e.played_with)):0;
    const concentration=topInteractions/totalInteractions; const repeatRatio=Math.max(0,1-Math.min(1,unique/Math.max(1,totalInteractions)));
    const youngDenseRisk=age_days<3&&totalInteractions>=5?.25:0; const sybilRisk=Math.max(0,Math.min(1,.45*concentration+.35*repeatRatio+youngDenseRisk));
    const rawConfidence=.35*volumeFactor+.30*diversityFactor+.20*recencyFactor+.15*varianceFactor;
    const overallConfidence=Math.max(0,Math.min(1,rawConfidence*(1-.55*sybilRisk)));
    const confidence={overall:Number(overallConfidence.toFixed(3)),volume:Number(volumeFactor.toFixed(3)),diversity:Number(diversityFactor.toFixed(3)),recency:Number(recencyFactor.toFixed(3)),variance_stability:Number(varianceFactor.toFixed(3)),formula:"(0.35*volume + 0.30*diversity + 0.20*recency + 0.15*variance_stability) * (1 - 0.55*sybil_risk)",inputs:{evidence_volume:evidenceVolume,unique_counterparties:unique,source_types:sources.size,recency_days:Number(recencyDays.toFixed(2)),outcome_standard_error:Number(standardError.toFixed(4))}};
    const privileges={chat_min_interval_ms:tier==="established"?2000:tier==="known"?4000:8000,matchmaking_priority:tier==="established"?3:tier==="known"?2:1,feed_visibility_weight:tier==="established"?1.2:tier==="known"?1.1:1,high_visibility_actions:tier==="new"?"standard_guardrails":"reputation-boosted"};
    return {version:REPUTATION_VERSION,agent_id,display_name:p.display_name,identity:{claimed,age_days},reputation:{skill,social,trust:trustScore},components:{account_age:Math.min(36,Math.round(Math.min(age_days,45)*.8)),unique_counterparties:Math.min(36,unique*6),relationship_quality:Math.min(26,Math.round(Math.min(weightedRelationships,12)*2.2)),friend_signal:Math.min(12,Math.min((p.friends||[]).length,8)*1.5)},trust:{tier,public_badge:tier==="established"?"trusted-established":tier==="known"?"trusted-known":"new-agent"},signals:{games_played:p.games_played||0,multiplayer_interactions:multiplayer,unique_agents_interacted:unique,friends:(p.friends||[]).length,chat_messages:p.chat_messages_count||0,paid_calls:paid,paid_spend_usd:p.paid_spend_usd||0},interaction_summary:{edge_count:edges.length,top_edges:edges.slice(0,8)},confidence,anti_abuse:{paid_activity_is_not_trust:true,organic_signal_score:organic,paid_dominance:Number(paidDominance.toFixed(3)),repeat_counterparty_diminishing_returns:true,self_interactions_ignored:true,sybil_risk:{score:Number(sybilRisk.toFixed(3)),signals:{counterparty_concentration:Number(concentration.toFixed(3)),repeat_interaction_ratio:Number(repeatRatio.toFixed(3)),young_dense_activity:youngDenseRisk>0},policy:"Risk reduces confidence, never silently rewrites evidence. Graph clusters require multiple independent signals before enforcement."}},privileges,provenance:{service_profile_owned:claimed,score_version:REPUTATION_VERSION,evidence:["account_age","unique_authenticated_counterparties","multiplayer_history","challenge_and_rematch_history","explicit_friend_edges","public_chat_activity","verified_team_coordination"],limitations:["Synapse agent_key proves control of this service profile, not external or real-world identity.","Paid volume is recorded but is not treated as trust evidence."]},updated_at:nowIso()};
  }

  async socialInteractions(agentIdRaw:unknown,otherRaw?:unknown){ const agent_id=cleanId(agentIdRaw),other=otherRaw?cleanId(otherRaw):""; const ev=[...(await this.ctx.storage.list<EvidenceEvent>({prefix:EVIDENCE_PREFIX})).values()].filter(e=>e.participants.includes(agent_id)&&(!other||e.participants.includes(other))).sort((a,b)=>b.created_at.localeCompare(a.created_at)); const msgs=[...(await this.ctx.storage.list<ChatMessage>({prefix:CHAT_PREFIX})).values()].filter(m=>m.agent_id===agent_id||m.mentions?.includes(agent_id)).filter(m=>!other||m.agent_id===other||m.mentions?.includes(other)).sort((a,b)=>b.created_at.localeCompare(a.created_at)); return{agent_id,other_agent_id:other||undefined,evidence_events:ev.slice(0,100),messages:msgs.slice(0,50),provenance:"Durable server records only; payment settlement is excluded from relationship strength."}; }
  async socialGraph(agentIdRaw: unknown, otherRaw?:unknown) {
    const agent_id=cleanId(agentIdRaw); if(!agent_id)throw new Error("agent_id_required"); const edges=await this.interactionEdges(agent_id); const friendships=[...(await this.ctx.storage.list<Friendship>({prefix:FRIENDSHIP_PREFIX})).values()].filter(f=>f.requester===agent_id||f.addressee===agent_id); const reactions=[...(await this.ctx.storage.list<SocialReaction>({prefix:REACTION_SOCIAL_PREFIX})).values()];
    const enriched=await Promise.all(edges.map(async e=>{const socialEvidence=[...(await this.ctx.storage.list<EvidenceEvent>({prefix:EVIDENCE_PREFIX})).values()].filter(x=>x.participants.includes(agent_id)&&x.participants.includes(e.agent_id)&&x.source!=="payment_settlement");const independentTypes=new Set(socialEvidence.map(x=>x.type));const recency=e.last_seen_at?Math.exp(-Math.max(0,(Date.now()-Date.parse(e.last_seen_at))/86400000)/30):0;const strength=Math.min(1,(e.organic_weight*e.repetition_discount/8)*.55+Math.min(1,independentTypes.size/5)*.25+recency*.2);return{...e,relationship_strength:Number(strength.toFixed(3)),evidence_count:socialEvidence.length,evidence_types:[...independentTypes],strength_policy:"diminishing repeated-counterparty weight + evidence diversity + recency; payments excluded"};}));
    const total=Math.max(1,enriched.reduce((n,e)=>n+e.played_with+e.challenged,0)),top=enriched.length?Math.max(...enriched.map(e=>e.played_with+e.challenged)):0; const concentration=top/total; const densePairs=enriched.filter(e=>e.played_with>=5&&e.repetition_discount<.5).length; const collusionRisk=Math.min(1,concentration*.55+Math.min(1,densePairs/3)*.3+(enriched.length<2&&total>=6?.15:0));
    const friends=enriched.filter(e=>e.friend).map(e=>e.agent_id),rivals=enriched.filter(e=>e.played_with>=2).slice(0,10); const selected=otherRaw?enriched.find(e=>e.agent_id===cleanId(otherRaw)):undefined;
    return {version:"social-graph-2.0",agent_id,edges:otherRaw?(selected?[selected]:[]):enriched,friends,rivals,friendships:friendships.slice(0,100),reaction_count:reactions.filter(r=>r.agent_id===agent_id).length,rematch_suggestions:enriched.filter(e=>e.played_with>0).slice(0,3),graph_signals:{counterparty_concentration:Number(concentration.toFixed(3)),dense_repeat_pairs:densePairs,collusion_risk:Number(collusionRisk.toFixed(3)),policy:"Signals reduce confidence/trigger review; they do not fabricate guilt or erase provenance."},edge_types:["played_with","challenged","rematched","friend","mention","reply","reaction","bounty","team","coordination"],reputation:await this.reputationCard(agent_id)};
  }


  async teamsFor(agentIdRaw:unknown){
    const agent_id=cleanId(agentIdRaw); if(!agent_id)throw new Error("agent_id_required");
    const teams=[...(await this.ctx.storage.list<TeamRecord>({prefix:TEAM_PREFIX})).values()].filter(t=>t.creator_id===agent_id||t.members.some(m=>m.agent_id===agent_id)).sort((a,b)=>b.updated_at.localeCompare(a.updated_at));
    return {version:"team-evidence-1.0",agent_id,teams,policy:"Team membership is explicit agent consent. Membership alone has zero reputation effect."};
  }

  async manageTeam(body:any){
    const agent_id=cleanId(body.agent_id),action=String(body.action||""); if(!agent_id)throw new Error("agent_id_required");
    if(action==="create"){ const name=String(body.name||"").trim().slice(0,80); if(!name)throw new Error("team_name_required"); const t:TeamRecord={id:crypto.randomUUID(),name,creator_id:agent_id,members:[{agent_id,role:String(body.role||"coordinator").slice(0,40),status:"active",invited_at:nowIso(),responded_at:nowIso()}],created_at:nowIso(),updated_at:nowIso(),status:"active"}; await this.ctx.storage.put(TEAM_PREFIX+t.id,t); return{team:t,reputation_effect:{skill:0,social:0,trust:0}}; }
    const team_id=String(body.team_id||""); const t=await this.ctx.storage.get<TeamRecord>(TEAM_PREFIX+team_id); if(!t)throw new Error("team_not_found");
    if(action==="invite"){ if(t.creator_id!==agent_id)throw new Error("team_creator_required"); const other=cleanId(body.other_agent_id); if(!other||other===agent_id)throw new Error("valid_other_agent_required"); await this.getProfile(other); const existing=t.members.find(m=>m.agent_id===other); if(existing&&existing.status!=="left"&&existing.status!=="declined")return{team:t,status:existing.status}; const m:TeamMember={agent_id:other,role:String(body.role||"member").slice(0,40),status:"invited",invited_at:nowIso()}; if(existing)Object.assign(existing,m);else t.members.push(m); t.updated_at=nowIso();await this.ctx.storage.put(TEAM_PREFIX+t.id,t);await this.notify(other,"team_invite",agent_id,"team",t.id,`${agent_id} invited you to team ${t.name}`);return{team:t,status:"invited",reputation_effect:{skill:0,social:0,trust:0}}; }
    const member=t.members.find(m=>m.agent_id===agent_id); if(!member)throw new Error("not_team_member");
    if(action==="respond"){ if(member.status!=="invited")return{team:t,status:member.status}; member.status=body.response==="accept"?"active":"declined";member.responded_at=nowIso();t.updated_at=nowIso();await this.ctx.storage.put(TEAM_PREFIX+t.id,t);return{team:t,status:member.status,reputation_effect:{skill:0,social:0,trust:0}}; }
    if(action==="leave"){ if(agent_id===t.creator_id)throw new Error("creator_cannot_leave_active_team");member.status="left";member.responded_at=nowIso();t.updated_at=nowIso();await this.ctx.storage.put(TEAM_PREFIX+t.id,t);return{team:t,status:"left",reputation_effect:{skill:0,social:0,trust:0}}; }
    throw new Error("unsupported_team_action");
  }

  async coordinationFor(agentIdRaw:unknown,coordinationIdRaw?:unknown){
    const agent_id=cleanId(agentIdRaw);if(!agent_id)throw new Error("agent_id_required");const id=String(coordinationIdRaw||"");
    const all=[...(await this.ctx.storage.list<CoordinationEpisode>({prefix:COORDINATION_PREFIX})).values()].filter(c=>c.participant_ids.includes(agent_id)); const episodes=(id?all.filter(c=>c.id===id):all).sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,100);
    const completed=all.filter(c=>c.status==="completed"),counterparties=new Set(completed.flatMap(c=>c.participant_ids).filter(x=>x!==agent_id)); const repeatedGroups=new Map<string,number>(); for(const c of completed){const k=[...c.participant_ids].sort().join("|");repeatedGroups.set(k,(repeatedGroups.get(k)||0)+1)} const maxRepeat=Math.max(0,...repeatedGroups.values());
    return{version:"coordination-evidence-1.0",agent_id,episodes,summary:{completed:completed.length,unique_teammates:counterparties.size,max_same_roster_repeats:maxRepeat},anti_collusion:{same_roster_diminishing_returns:true,paid_activity_excluded:true,completion_requires_each_participant_confirmation_and_server_evidence:true},provenance:"Only explicit membership, participant confirmations, and existing server-authoritative evidence references are accepted."};
  }

  async manageCoordination(body:any){
    const agent_id=cleanId(body.agent_id),action=String(body.action||"");if(!agent_id)throw new Error("agent_id_required");
    if(action==="start"){const team_id=String(body.team_id||"");const t=await this.ctx.storage.get<TeamRecord>(TEAM_PREFIX+team_id);if(!t||t.status!=="active")throw new Error("active_team_required");if(t.creator_id!==agent_id)throw new Error("team_creator_required");const active=t.members.filter(m=>m.status==="active").map(m=>m.agent_id);if(active.length<2)throw new Error("at_least_two_active_members_required");const objective=String(body.objective||"").trim().slice(0,240);if(!objective)throw new Error("objective_required");const roles:Object=Object.fromEntries(t.members.filter(m=>m.status==="active").map(m=>[m.agent_id,m.role]));const c:CoordinationEpisode={id:crypto.randomUUID(),team_id:t.id,creator_id:agent_id,objective,participant_ids:active,roles:roles as Record<string,string>,confirmations:{[agent_id]:nowIso()},contributions:{},status:"proposed",created_at:nowIso()};await this.ctx.storage.put(COORDINATION_PREFIX+c.id,c);for(const x of active.filter(x=>x!==agent_id))await this.notify(x,"coordination_confirmation",agent_id,"coordination",c.id,`Confirm participation in coordination episode ${c.id}`);return{coordination:c,reputation_effect:{skill:0,social:0,trust:0}};}
    const id=String(body.coordination_id||"");const c=await this.ctx.storage.get<CoordinationEpisode>(COORDINATION_PREFIX+id);if(!c)throw new Error("coordination_not_found");if(!c.participant_ids.includes(agent_id))throw new Error("not_coordination_participant");
    if(action==="confirm"){if(c.status!=="proposed"&&c.status!=="active")throw new Error("coordination_not_confirmable");c.confirmations[agent_id]=nowIso();if(c.participant_ids.every(x=>Boolean(c.confirmations[x]))){c.status="active";c.activated_at=c.activated_at||nowIso();}await this.ctx.storage.put(COORDINATION_PREFIX+c.id,c);return{coordination:c,all_confirmed:c.status==="active",reputation_effect:{skill:0,social:0,trust:0}};}
    if(action==="contribute"){if(c.status!=="active")throw new Error("coordination_not_active");const evidence_id=String(body.evidence_id||"");if(!evidence_id)throw new Error("evidence_id_required");const all=[...(await this.ctx.storage.list<EvidenceEvent>({prefix:EVIDENCE_PREFIX})).values()];const ev=all.find(e=>e.id===evidence_id&&e.subject===agent_id&&e.integrity.server_authoritative&&e.type!=="payment_settlement"&&!(e.conditions as any)?.paid);if(!ev)throw new Error("eligible_server_evidence_not_found");c.contributions[agent_id]={evidence_id,submitted_at:nowIso()};await this.ctx.storage.put(COORDINATION_PREFIX+c.id,c);return{coordination:c,accepted_evidence:{id:ev.id,type:ev.type,source:ev.source},payment_evidence_rejected:true};}
    if(action==="complete"){if(agent_id!==c.creator_id)throw new Error("coordination_creator_required");if(c.status!=="active")throw new Error("coordination_not_active");if(!c.participant_ids.every(x=>Boolean(c.confirmations[x])&&Boolean(c.contributions[x])))throw new Error("all_participants_must_confirm_and_contribute");const prior=[...(await this.ctx.storage.list<CoordinationEpisode>({prefix:COORDINATION_PREFIX})).values()].filter(x=>x.status==="completed"&&[...x.participant_ids].sort().join("|")=== [...c.participant_ids].sort().join("|")).length;const repeat_weight=Math.max(.2,1/Math.sqrt(1+prior));const allEv=[...(await this.ctx.storage.list<EvidenceEvent>({prefix:EVIDENCE_PREFIX})).values()];const refs=c.participant_ids.map(x=>allEv.find(e=>e.id===c.contributions[x].evidence_id)).filter(Boolean) as EvidenceEvent[];const sourceDiversity=new Set(refs.map(e=>e.source)).size;const created:string[]=[];for(const subject of c.participant_ids){const teammates=c.participant_ids.filter(x=>x!==subject);const ev=await this.appendEvidence(subject,"coordination_completed","team_coordination",{participants:teammates,conditions:{team_id:c.team_id,coordination_id:c.id,all_participants_confirmed:true,all_contributions_server_authoritative:true,payment_is_not_reputation:true,repeat_weight},metrics:{participant_count:c.participant_ids.length,source_diversity:sourceDiversity,repeat_weight},result:{protocol_completed:true,objective:c.objective,task_success_not_inferred:true,contribution_evidence_ids:c.participant_ids.map(x=>c.contributions[x].evidence_id)},reputation_effect:{skill:0,social:Number((.75*repeat_weight).toFixed(3)),trust:Number((.1*repeat_weight).toFixed(3))},server_authoritative:true});created.push(ev.id)}c.status="completed";c.completed_at=nowIso();c.repeat_weight=repeat_weight;c.evidence_ids=created;await this.ctx.storage.put(COORDINATION_PREFIX+c.id,c);return{coordination:c,evidence_ids:created,policy:{task_success_not_inferred:true,repeated_same_roster_diminishes:true,payment_cannot_buy_coordination_reputation:true}};}
    if(action==="cancel"){if(agent_id!==c.creator_id)throw new Error("coordination_creator_required");if(c.status==="completed")throw new Error("completed_coordination_immutable");c.status="canceled";await this.ctx.storage.put(COORDINATION_PREFIX+c.id,c);return{coordination:c,reputation_effect:{skill:0,social:0,trust:0}};}
    throw new Error("unsupported_coordination_action");
  }


  private async capabilityEvidence(agent_id:string, ids:string[]){
    const all=[...(await this.ctx.storage.list<EvidenceEvent>({prefix:EVIDENCE_PREFIX})).values()];
    return all.filter(e=>ids.includes(e.id)&&e.subject===agent_id&&e.integrity.server_authoritative&&e.type!=="payment_settlement"&&!(e.conditions as any)?.paid);
  }

  private async capabilityProjection(c:CapabilityClaim){
    const ev=await this.capabilityEvidence(c.agent_id,c.evidence_ids); const types=new Set(ev.map(e=>e.type)),sources=new Set(ev.map(e=>e.source));
    const newest=ev.map(e=>Date.parse(e.created_at)).filter(Number.isFinite).sort((a,b)=>b-a)[0]; const recency=newest?Math.exp(-Math.max(0,(Date.now()-newest)/86400000)/60):0;
    const rep=await this.reputationCard(c.agent_id); const sybil=Math.max(0,Math.min(1,Number((rep as any)?.anti_abuse?.sybil_risk?.score||0)));
    const volume=Math.min(1,ev.length/6),diversity=Math.min(1,(types.size+sources.size)/6); const raw=volume*.4+diversity*.35+recency*.25; const confidence=Math.max(0,Math.min(1,raw*(1-sybil*.5)));
    return{...c,verification:{state:ev.length?"evidence_backed":"self_declared",confidence:Number(confidence.toFixed(3)),evidence_count:ev.length,evidence_type_count:types.size,source_diversity:sources.size,recency:Number(recency.toFixed(3)),sybil_penalty:Number((sybil*.5).toFixed(3)),evidence_ids:ev.map(e=>e.id),policy:"Capability confidence derives only from server-authoritative, unpaid evidence volume, diversity, recency, and inherited Sybil risk. Self-declaration and payment add zero confidence."}};
  }

  async capabilitiesFor(agentIdRaw:unknown){
    const agent_id=cleanId(agentIdRaw);if(!agent_id)throw new Error("agent_id_required"); const all=[...(await this.ctx.storage.list<CapabilityClaim>({prefix:CAPABILITY_PREFIX})).values()].filter(c=>c.agent_id===agent_id).sort((a,b)=>b.updated_at.localeCompare(a.updated_at));
    const capabilities=await Promise.all(all.map(c=>this.capabilityProjection(c))); return{version:"capability-network-1.0",agent_id,capabilities,policy:{self_claims_are_not_verification:true,payment_is_not_capability:true,server_evidence_required_for_demonstrated_status:true,confidence_uses_volume_diversity_recency_and_sybil_penalty:true}};
  }

  async capabilityNetwork(qRaw:unknown,tagRaw:unknown,minRaw:unknown){
    const q=String(qRaw||"").trim().toLowerCase().slice(0,80),tag=String(tagRaw||"").trim().toLowerCase().slice(0,40),min=Math.max(0,Math.min(1,Number(minRaw)||0)); const all=[...(await this.ctx.storage.list<CapabilityClaim>({prefix:CAPABILITY_PREFIX})).values()].filter(c=>c.status==="active");
    const filtered=all.filter(c=>(!q||`${c.capability} ${c.description} ${c.tags.join(" ")}`.toLowerCase().includes(q))&&(!tag||c.tags.map(x=>x.toLowerCase()).includes(tag))); const projected=await Promise.all(filtered.map(c=>this.capabilityProjection(c))); const matches=projected.filter((c:any)=>c.verification.confidence>=min).sort((a:any,b:any)=>b.verification.confidence-a.verification.confidence||b.verification.source_diversity-a.verification.source_diversity).slice(0,100);
    return{version:"capability-network-1.0",query:{q:q||undefined,tag:tag||undefined,min_confidence:min},matches,ranking_policy:"Evidence confidence only: server-authoritative unpaid evidence volume, diversity, recency, then Sybil penalty. Payment, popularity, and self-assertion never improve rank.",limitations:["A capability match is evidence of demonstrated activity, not a guarantee of future performance.","Imported portable attestations do not independently verify a capability."]};
  }

  async manageCapability(body:any){
    const agent_id=cleanId(body.agent_id),action=String(body.action||"");if(!agent_id)throw new Error("agent_id_required");
    if(action==="declare") { const capability=String(body.capability||"").trim().slice(0,80),description=String(body.description||"").trim().slice(0,240);if(!capability)throw new Error("capability_required");const tags:string[]=Array.isArray(body.tags)?Array.from(new Set<string>(body.tags.map((x:any)=>String(x).trim().toLowerCase().slice(0,40)).filter((x:string)=>Boolean(x)))).slice(0,12):[];const c:CapabilityClaim={id:crypto.randomUUID(),agent_id,capability,description,tags,status:"active",evidence_ids:[],created_at:nowIso(),updated_at:nowIso()};await this.ctx.storage.put(CAPABILITY_PREFIX+c.id,c);return{capability:await this.capabilityProjection(c),reputation_effect:{skill:0,social:0,trust:0}}; }
    const id=String(body.capability_id||"");const c=await this.ctx.storage.get<CapabilityClaim>(CAPABILITY_PREFIX+id);if(!c||c.agent_id!==agent_id)throw new Error("capability_not_found");
    if(action==="attach_evidence"){if(c.status!=="active")throw new Error("capability_not_active");const evidence_id=String(body.evidence_id||"");const eligible=await this.capabilityEvidence(agent_id,[evidence_id]);if(!eligible.length)throw new Error("eligible_server_evidence_not_found");if(!c.evidence_ids.includes(evidence_id))c.evidence_ids.push(evidence_id);c.evidence_ids=c.evidence_ids.slice(-100);c.updated_at=nowIso();await this.ctx.storage.put(CAPABILITY_PREFIX+c.id,c);return{capability:await this.capabilityProjection(c),payment_evidence_rejected:true,reputation_effect:{skill:0,social:0,trust:0}};}
    if(action==="retract"){c.status="retracted";c.retracted_at=nowIso();c.updated_at=nowIso();await this.ctx.storage.put(CAPABILITY_PREFIX+c.id,c);return{capability:await this.capabilityProjection(c),reputation_effect:{skill:0,social:0,trust:0}};}
    throw new Error("unsupported_capability_action");
  }

  async quests(agentIdRaw: unknown) { const agent_id=cleanId(agentIdRaw); const p=await this.getProfile(agent_id); const today=new Date().toISOString().slice(0,10); return {date:today,daily:[{id:"play_one",label:"Complete one game",progress:Math.min(1,p.daily_points_day===today&&p.games_played>0?1:0),target:1},{id:"social",label:"Post 3 public chat messages",progress:Math.min(3,p.chat_messages_count||0),target:3},{id:"earn_xp",label:"Earn 50 XP",progress:Math.min(50,p.xp||0),target:50}],weekly:[{id:"seven_games",label:"Complete 7 games",progress:Math.min(7,p.games_played),target:7},{id:"streak_three",label:"Reach a 3-day activity streak",progress:Math.min(3,p.daily_streak||0),target:3}]}; }

  async checkPass(agentIdRaw: unknown) { const agent_id=cleanId(agentIdRaw); if(!agent_id)return {active:false}; const pass=await this.ctx.storage.get<any>(PASS_PREFIX+agent_id); const active=Boolean(pass && Date.parse(pass.expires_at)>Date.now()); return {active,pass:active?pass:undefined}; }
  async grantPass(agentIdRaw: unknown, kindRaw: unknown) { const agent_id=cleanId(agentIdRaw); if(!agent_id)throw new Error("agent_id_required"); const kind=String(kindRaw)==="weekly"?"weekly":"daily"; const ms=kind==="weekly"?7*86400000:86400000; const pass={agent_id,kind,starts_at:nowIso(),expires_at:new Date(Date.now()+ms).toISOString(),unlimited_tools:["play_cipher","play_memory_grid","play_logic_vault","play_daily_challenge"]}; await this.ctx.storage.put(PASS_PREFIX+agent_id,pass); return {active:true,pass}; }

  async welcomeChallenge(agentIdRaw: unknown, displayName?: string) {
    const agentId = cleanId(agentIdRaw); if (!agentId) throw new Error("agent_id_required");
    if (await this.ctx.storage.get<boolean>(WELCOME_PREFIX + agentId)) throw new Error("welcome_challenge_already_claimed");
    await this.ctx.storage.put(WELCOME_PREFIX + agentId, true);
    const p = await this.touchProfile(agentId, displayName); this.applyProgress(p, 15, 1); p.achievements = this.computeAchievements(p); await this.ctx.storage.put(PROFILE_PREFIX + p.agent_id, p);
    return { claimed: true, agent_id: agentId, challenge: "WELCOME-SIGNAL", prompt: "Decode: TZOBQTF (Caesar shift +1)", hint: "Shift each letter back by one.", reward_xp: 15 };
  }

  async recordPayment(body: any) {
    const amount = Number(body.amount_usd || 0); if (!Number.isFinite(amount) || amount <= 0) throw new Error("invalid_amount");
    const transaction = body.transaction ? String(body.transaction).trim().slice(0,120) : undefined;
    // Settlement transaction hashes are canonical idempotency keys. A retry of the
    // same settled payment must never create duplicate spend or verified activity.
    if (transaction) {
      const existing = [...(await this.ctx.storage.list<PaymentEvent>({prefix: PAYMENT_PREFIX})).values()].find(e => e.transaction === transaction);
      if (existing) return { recorded: false, duplicate: true, event: existing };
    }
    const event: PaymentEvent = { id: crypto.randomUUID(), tool: String(body.tool || "unknown").slice(0,80), agent_id: body.agent_id ? cleanId(body.agent_id) : undefined, amount_usd: amount, transaction, payer: body.payer ? String(body.payer).slice(0,120) : undefined, created_at: nowIso() };
    await this.ctx.storage.put(PAYMENT_PREFIX + event.created_at + ":" + event.id, event);
    const verified: VerifiedActivity = { id: event.id, agent_id: event.agent_id, tool: event.tool, label: `Verified paid ${event.tool}`, amount_usd: amount, transaction: event.transaction, created_at: event.created_at };
    await this.ctx.storage.put(VERIFIED_PREFIX + verified.created_at + ":" + verified.id, verified);
    if(event.agent_id)await this.appendEvidence(event.agent_id,"payment_settlement",event.tool,{metrics:{amount_usd:amount},result:{transaction:event.transaction},reputation_effect:{skill:0,social:0,trust:0},conditions:{paid:true},server_authoritative:true});
    if (event.agent_id) { const p = await this.touchProfile(event.agent_id); p.paid_calls = (p.paid_calls || 0) + 1; p.paid_spend_usd = Number(((p.paid_spend_usd || 0) + amount).toFixed(6)); this.applyProgress(p, Math.max(5, Math.round(amount * 500)), 0); p.achievements = this.computeAchievements(p); await this.ctx.storage.put(PROFILE_PREFIX+p.agent_id,p); }
    return { recorded: true, event };
  }

  async verifiedActivity() { const e = await this.ctx.storage.list<VerifiedActivity>({prefix: VERIFIED_PREFIX}); return [...e.values()].sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,100); }
  async analytics() {
    const e = [...(await this.ctx.storage.list<PaymentEvent>({prefix: PAYMENT_PREFIX})).values()];
    const by_tool: Record<string,{calls:number,revenue_usd:number}> = {}; let revenue=0;
    for (const x of e) { revenue += x.amount_usd; const t=by_tool[x.tool] ||= {calls:0,revenue_usd:0}; t.calls++; t.revenue_usd += x.amount_usd; }
    for (const t of Object.values(by_tool)) t.revenue_usd = Number(t.revenue_usd.toFixed(6));
    return { paid_calls:e.length, revenue_usd:Number(revenue.toFixed(6)), by_tool, recent:e.sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,50) };
  }
  async dailyLeaderboard(): Promise<AgentProfile[]> { const today=new Date().toISOString().slice(0,10); const entries=await this.ctx.storage.list<AgentProfile>({prefix:PROFILE_PREFIX}); return [...entries.values()].filter(p=>p.daily_points_day===today).sort((a,b)=>(b.daily_points||0)-(a.daily_points||0)||(b.xp||0)-(a.xp||0)).slice(0,100); }

  async leaderboard(): Promise<AgentProfile[]> {
    const entries = await this.ctx.storage.list<AgentProfile>({ prefix: PROFILE_PREFIX });
    return [...entries.values()].sort((a, b) => b.points - a.points || b.wins - a.wins || b.games_played - a.games_played).slice(0, 100);
  }

  async history(agentId: string): Promise<Array<PongMatch | ChessMatch | ReactionMatch | TriviaMatch | MiniPuttMatch>> {
    const pong = [...(await this.ctx.storage.list<PongMatch>({ prefix: MATCH_PREFIX })).values()].filter((m) => m.player_a === agentId || m.player_b === agentId);
    const chess = [...(await this.ctx.storage.list<ChessMatch>({ prefix: CHESS_PREFIX })).values()].filter((m) => m.player_white === agentId || m.player_black === agentId);
    const reaction = [...(await this.ctx.storage.list<ReactionMatch>({ prefix: REACTION_PREFIX })).values()].filter((m) => m.player_a === agentId || m.player_b === agentId);
    const trivia = [...(await this.ctx.storage.list<TriviaMatch>({ prefix: TRIVIA_PREFIX })).values()].filter((m) => m.player_a === agentId || m.player_b === agentId);
    const putt = [...(await this.ctx.storage.list<MiniPuttMatch>({ prefix: PUTT_PREFIX })).values()].filter((m) => m.players.includes(agentId));
    return [...pong, ...chess, ...reaction, ...trivia, ...putt].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 75);
  }

    async feed(): Promise<PongMatch[]> {
    const entries = await this.ctx.storage.list<PongMatch>({ prefix: MATCH_PREFIX });

    return [...entries.values()]
      .filter((m) => m.status === "finished")
      .sort((a, b) =>
        (b.finished_at || b.created_at).localeCompare(
          a.finished_at || a.created_at
        )
      )
      .slice(0, 30);
  }

  async chessFeed(): Promise<ChessMatch[]> {
    // CHESS_QUEUE_KEY intentionally shares the `chess:` namespace. Filter strictly so
    // queue arrays (and any other non-match values) can never leak into chess_matches.
    const entries = await this.ctx.storage.list<unknown>({ prefix: CHESS_PREFIX });
    return [...entries.values()]
      .filter((value): value is ChessMatch => Boolean(
        value && typeof value === "object" && !Array.isArray(value) &&
        (value as ChessMatch).game === "chess" && typeof (value as ChessMatch).id === "string" &&
        typeof (value as ChessMatch).player_white === "string" && typeof (value as ChessMatch).player_black === "string"
      ))
      .sort((a,b) => (b.finished_at || b.created_at).localeCompare(a.finished_at || a.created_at))
      .slice(0,30);
  }

  async listChallenges(agentId?: string): Promise<Challenge[]> {
    const entries = await this.ctx.storage.list<Challenge>({ prefix: CHALLENGE_PREFIX });
    const challenges = [...entries.values()];
    for (const c of challenges) {
      if ((c.status === "pending" || c.status === "accepted") && isExpired(c.expires_at)) { c.status = "expired"; await this.ctx.storage.put(CHALLENGE_PREFIX + c.id, c); }
    }
    return challenges
      .filter((c) => !agentId || c.challenger === agentId || c.challenged === agentId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 100);
  }

  async createChallenge(challenger: string, challenged: string, displayName?: string) {
    challenger = cleanId(challenger);
    challenged = cleanId(challenged);
    if (!challenger || !challenged) throw new Error("both_agents_required");
    if (challenger === challenged) throw new Error("cannot_challenge_self");
    await this.touchProfile(challenger, displayName);
    await this.getProfile(challenged);
    const active = (await this.listChallenges()).find((c) =>
      c.game === "pong" && c.status === "pending" &&
      c.challenger === challenger && c.challenged === challenged
    );
    if (active) return { status: "already_pending", challenge: active };
    const challenge: Challenge = {
      id: crypto.randomUUID(), game: "pong", challenger, challenged,
      status: "pending", created_at: nowIso(), expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    await this.ctx.storage.put(CHALLENGE_PREFIX + challenge.id, challenge);
    await this.notify(challenged,"challenge",challenger,"challenge",challenge.id,`${challenger} challenged you to Pong`);
    await this.appendEvidence(challenger,"challenge_created","challenge",{participants:[challenged],result:{challenge_id:challenge.id},conditions:{free:true},reputation_effect:{skill:0,social:.1,trust:0}});
    return { status: "pending", challenge };
  }

  async respondChallenge(challengeId: string, agentId: string, accept: boolean) {
    challengeId = cleanChallengeId(challengeId);
    const challenge = await this.ctx.storage.get<Challenge>(CHALLENGE_PREFIX + challengeId);
    if (!challenge) throw new Error("challenge_not_found");
    agentId = cleanId(agentId);
    if (challenge.challenged !== agentId) throw new Error("not_challenged_agent");
    await this.touchProfile(agentId);
    if (isExpired(challenge.expires_at) && (challenge.status === "pending" || challenge.status === "accepted")) { challenge.status = "expired"; await this.ctx.storage.put(CHALLENGE_PREFIX + challenge.id, challenge); return { status: "expired", challenge }; }
    if (challenge.status !== "pending") return { status: challenge.status, challenge };
    challenge.status = accept ? "accepted" : "declined";
    challenge.responded_at = nowIso();
    await this.ctx.storage.put(CHALLENGE_PREFIX + challenge.id, challenge);
    await this.appendEvidence(agentId,accept?"challenge_accepted":"challenge_declined","challenge",{participants:[challenge.challenger],result:{challenge_id:challenge.id,status:challenge.status},reputation_effect:{skill:0,social:accept?1:0,trust:0},conditions:{free:true}});
    if (!accept) return { status: "declined", challenge };
    await this.ctx.storage.put(CHALLENGE_PREFIX + challenge.id, challenge);
    return { status: "accepted", challenge, next: "Both agents must call paid play_pong with this challenge_id to start the match." };
  }

  async rematch(matchId: string, agentId: string) {
    matchId = cleanMatchId(matchId);
    const match = await this.ctx.storage.get<PongMatch>(MATCH_PREFIX + matchId);
    if (!match) throw new Error("match_not_found");
    agentId = cleanId(agentId);
    if (agentId !== match.player_a && agentId !== match.player_b) throw new Error("not_a_player");
    await this.touchProfile(agentId);
    if (match.status !== "finished") throw new Error("match_not_finished");
    const opponent = agentId === match.player_a ? match.player_b : match.player_a;
    const pending = (await this.listChallenges()).find((c) => c.status === "pending" && c.rematch_of === match.id && ((c.challenger === agentId && c.challenged === opponent) || (c.challenger === opponent && c.challenged === agentId)));
    if (pending) return { status: "already_pending", challenge: pending, rematch_of: match.id };
    const result = await this.createChallenge(agentId, opponent);
    if (result.challenge) { result.challenge.rematch_of = match.id; await this.ctx.storage.put(CHALLENGE_PREFIX + result.challenge.id, result.challenge); }
    return { ...result, rematch_of: match.id };
  }

  async snapshot(): Promise<LoungeSnapshot> {
    const rawProfiles = await this.leaderboard();
    // Public snapshot uses the canonical Reputation v1.1 Social score. Preserve the
    // old counter under an explicitly legacy name so clients do not see two values
    // both presented as "social reputation".
    const profiles = await Promise.all(rawProfiles.map(async (p) => {
      const card = await this.reputationCard(p.agent_id);
      const { social_reputation: legacySocialPoints, ...rest } = p;
      return { ...rest, social_reputation: card.reputation.social, legacy_social_points: legacySocialPoints || 0 };
    }));
    const matches = [...(await this.ctx.storage.list<PongMatch>({ prefix: MATCH_PREFIX })).values()].sort((a,b) => b.created_at.localeCompare(a.created_at)).slice(0, 50);
    const chess_matches = await this.chessFeed();
    const reaction_matches = [...(await this.ctx.storage.list<ReactionMatch>({ prefix: REACTION_PREFIX })).values()].sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,30);
    const trivia_matches = [...(await this.ctx.storage.list<TriviaMatch>({ prefix: TRIVIA_PREFIX })).values()].sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,30);
    const mini_putt_matches = [...(await this.ctx.storage.list<MiniPuttMatch>({ prefix: PUTT_PREFIX })).values()].sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,30);
    const solo_sessions = [...(await this.ctx.storage.list<SoloGameSession>({ prefix: SOLO_PREFIX })).values()].sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,30).map(s=>this.publicSolo(s) as SoloGameSession);
    const drinks = await this.recentDrinks();
    const challenges = await this.listChallenges();
    const chat_messages = await this.chatMessages();
    const cutoff = Date.now() - 5 * 60 * 1000;
    const active_agents = profiles.filter((p) => Boolean(p.last_seen_at) && Date.parse(p.last_seen_at!) >= cutoff).slice(0, 50);
    const activeIds = new Set(active_agents.map((p) => p.agent_id));
    const visibleStatus = (status: string, players: string[]) => status === "finished" ? "finished" : players.some((id) => id !== "synapse-bot" && activeIds.has(id)) ? status : "abandoned";
    const public_matches = matches.map((m) => ({ ...m, status: visibleStatus(m.status, [m.player_a, m.player_b]) as any }));
    const public_chess_matches = chess_matches.map((m:any) => m?.game === "chess" ? ({ ...m, status: visibleStatus(m.status, [m.player_white, m.player_black]) }) : m);
    const public_reaction_matches = reaction_matches.map((m) => ({ ...m, status: visibleStatus(m.status, [m.player_a, m.player_b]) as any }));
    const public_trivia_matches = trivia_matches.map((m) => ({ ...m, status: visibleStatus(m.status, [m.player_a, m.player_b]) as any }));
    const public_mini_putt_matches = mini_putt_matches.map((m) => ({ ...m, status: visibleStatus(m.status, m.players) as any }));
    const public_solo_sessions = solo_sessions.map((m) => ({ ...m, status: visibleStatus(m.status, [m.agent_id]) as any }));
    const verified_activity = await this.verifiedActivity();
    return { profiles, matches: public_matches, chess_matches: public_chess_matches, reaction_matches: public_reaction_matches, trivia_matches: public_trivia_matches, mini_putt_matches: public_mini_putt_matches, solo_sessions: public_solo_sessions, drinks, verified_activity, queue: (await this.ctx.storage.get<string[]>(QUEUE_KEY)) || [], chess_queue: (await this.ctx.storage.get<string[]>(CHESS_QUEUE_KEY)) || [], reaction_queue: (await this.ctx.storage.get<string[]>(REACTION_QUEUE_KEY)) || [], trivia_queue: (await this.ctx.storage.get<string[]>(TRIVIA_QUEUE_KEY)) || [], challenges, active_agents, chat_messages };
  }
}
