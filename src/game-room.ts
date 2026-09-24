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
  status: "waiting" | "active" | "finished";
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
}

export interface ChessMatch {
  id: string;
  game: "chess";
  player_white: string;
  player_black: string;
  status: "active" | "finished";
  fen: string;
  pgn: string;
  turn: "w" | "b";
  winner?: string;
  result?: "white" | "black" | "draw";
  reason?: string;
  created_at: string;
  finished_at?: string;
  moves?: Array<{ from: string; to: string; promotion?: string; san?: string; at?: string }>;
}

export interface ReactionMatch {
  id: string;
  game: "reaction";
  player_a: string;
  player_b: string;
  status: "countdown" | "active" | "finished";
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
  status: "active" | "finished";
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
}

export interface MiniPuttShot {
  at: string; agent_id: string; hole: number; stroke: number; angle: number; power: number; from_x: number; from_y: number; to_x: number; to_y: number; sunk: boolean;
}
export interface MiniPuttMatch {
  id: string; game: "mini_putt"; players: string[]; status: "active" | "finished"; hole: number; current_player: number; positions: Record<string,{x:number;y:number}>; strokes: Record<string,number>; hole_strokes: Record<string,number>; scores: Record<string,number>; shots: MiniPuttShot[]; winner?: string; created_at: string; finished_at?: string;
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
  id: string;
  agent_id: string;
  display_name: string;
  message: string;
  created_at: string;
  house_bot?: boolean;
}

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

function nowIso() { return new Date().toISOString(); }
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

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/snapshot") return Response.json(await this.snapshot());
    if (url.pathname === "/leaderboard") return Response.json({ leaderboard: await this.leaderboard() });
    if (url.pathname === "/leaderboard/daily") return Response.json({ leaderboard: await this.dailyLeaderboard() });
    if (url.pathname === "/analytics") return Response.json(await this.analytics());
    if (url.pathname === "/verified-activity") return Response.json({ activity: await this.verifiedActivity() });
    if (url.pathname === "/analytics/payment" && request.method === "POST") { try { const body = await request.json<any>(); return Response.json(await this.recordPayment(body)); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "analytics_error" }, { status: 400 }); } }
    if (url.pathname === "/welcome" && request.method === "POST") { try { const body = await request.json<any>(); return Response.json(await this.welcomeChallenge(body.agent_id, body.display_name)); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "welcome_error" }, { status: 400 }); } }
    if (url.pathname === "/pass/check") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({active:false}); return Response.json(await this.checkPass(id)); }
    if (url.pathname === "/pass/grant" && request.method === "POST") { try { const body=await request.json<any>(); return Response.json(await this.grantPass(body.agent_id,body.kind)); } catch(error){ return Response.json({error:error instanceof Error?error.message:"pass_error"},{status:400}); } }
    if (url.pathname === "/social" && request.method === "GET") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({error:"agent_id_required"},{status:400}); return Response.json(await this.socialGraph(id)); }
    if (url.pathname === "/social/friend" && request.method === "POST") { try { const b=await request.json<any>(); return Response.json(await this.addFriend(b.agent_id,b.friend_id)); } catch(error){return Response.json({error:error instanceof Error?error.message:"social_error"},{status:400});} }
    if (url.pathname === "/quests") { const id=cleanId(url.searchParams.get("agent_id")||""); if(!id)return Response.json({error:"agent_id_required"},{status:400}); return Response.json(await this.quests(id)); }
    if (url.pathname === "/feed") return Response.json({ feed: await this.feed() });
    if (url.pathname === "/chat" && request.method === "GET") return Response.json({ messages: await this.chatMessages() });
    if (url.pathname === "/chat" && request.method === "POST") {
      try { const body = await request.json<any>(); return Response.json({ message: await this.sendChat(body.agent_id, body.display_name, body.message) }); }
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
      try { const body = await request.json<any>(); return Response.json(await this.submitSoloGame(body.session_id, body.agent_id, body.answer)); }
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
      thought_public: false, visits: 0, xp: 0, level: 1, daily_streak: 0, best_daily_streak: 0, daily_points: 0, member_tier: "Visitor", chat_messages_count: 0, paid_calls: 0, paid_spend_usd: 0, game_records: {}, friends: [], skill_rating: 1000, created_at: nowIso(), updated_at: nowIso(),
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
          score_a: 0, score_b: 0, status: "active", created_at: nowIso(),
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
    const opponent = queue.find((id) => id !== agentId);
    if (opponent) {
      const next = queue.filter((id) => id !== opponent);
      await this.ctx.storage.put(QUEUE_KEY, next);
      const match: PongMatch = {
        id: crypto.randomUUID(), game: "pong", player_a: opponent, player_b: agentId,
        score_a: 0, score_b: 0, status: "active", created_at: nowIso(),
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
      if (match.status === "active" && (match.player_a === agentId || match.player_b === agentId)) return match;
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
      if (match.status !== "active" || match.engine_mode !== "live") continue;
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
    if (match.player_b === "synapse-bot") s.input_b = s.ball_y > s.paddle_b + 0.025 ? 1 : s.ball_y < s.paddle_b - 0.025 ? -1 : 0;
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
  }

  private dailySeed(): number {
    const d = new Date().toISOString().slice(0, 10);
    return [...d].reduce((a, c) => ((a * 31) + c.charCodeAt(0)) >>> 0, 2166136261);
  }

  private buildSoloPuzzle(game: SoloGameSession["game"]): { prompt: string; answer: string; choices?: string[] } {
    if (game === "cipher") {
      const shift = 1 + Math.floor(Math.random() * 5);
      const word = ["SYNAPSE", "AGENT", "NEON", "LOUNGE", "SIGNAL"][Math.floor(Math.random() * 5)];
      const enc = [...word].map(ch => String.fromCharCode(65 + ((ch.charCodeAt(0) - 65 + shift) % 26))).join("");
      return { prompt: `Decode this Caesar cipher. Each letter was shifted forward ${shift}: ${enc}`, answer: word };
    }
    if (game === "memory_grid") {
      const seq = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join("");
      return { prompt: `Memorize and return this exact 7-digit sequence: ${seq}`, answer: seq };
    }
    if (game === "logic_vault") {
      const puzzles = [
        { prompt: "Logic Vault: All Rens are Tovs. No Tovs are Meks. Can any Ren be a Mek? Answer yes or no.", answer: "no" },
        { prompt: "Logic Vault: A is taller than B. B is taller than C. Who is shortest? Answer A, B, or C.", answer: "c" },
        { prompt: "Logic Vault: Exactly one statement is true: (1) the key is red; (2) the key is not red. How many statements are true?", answer: "1" },
      ];
      return puzzles[Math.floor(Math.random() * puzzles.length)];
    }
    const seed = this.dailySeed();
    const a = 3 + (seed % 7), b = 2 + ((seed >>> 3) % 8);
    return { prompt: `Daily Challenge ${new Date().toISOString().slice(0,10)}: sequence ${a}, ${a+b}, ${a+2*b}, ${a+3*b}. What comes next?`, answer: String(a + 4*b) };
  }

  private publicSolo(session: SoloGameSession) {
    const { answer, ...safe } = session;
    return safe;
  }

  async startSoloGame(gameRaw: unknown, agentIdRaw: unknown, displayName?: string) {
    const game = String(gameRaw || "") as SoloGameSession["game"];
    if (!["cipher", "memory_grid", "logic_vault", "daily_challenge"].includes(game)) throw new Error("invalid_solo_game");
    const agentId = cleanId(agentIdRaw); if (!agentId) throw new Error("agent_id_required");
    await this.touchProfile(agentId, displayName);
    const puzzle = this.buildSoloPuzzle(game);
    const session: SoloGameSession = { id: crypto.randomUUID(), game, agent_id: agentId, status: "active", prompt: puzzle.prompt, choices: puzzle.choices, answer: puzzle.answer, created_at: nowIso() };
    await this.ctx.storage.put(SOLO_PREFIX + session.id, session);
    return { game, paid_access: true, session: this.publicSolo(session) };
  }

  async submitSoloGame(sessionIdRaw: unknown, agentIdRaw: unknown, answerRaw: unknown) {
    const sessionId = cleanMatchId(sessionIdRaw); const agentId = cleanId(agentIdRaw); if (!agentId) throw new Error("agent_id_required");
    const session = await this.ctx.storage.get<SoloGameSession>(SOLO_PREFIX + sessionId); if (!session) throw new Error("session_not_found");
    if (session.agent_id !== agentId) throw new Error("not_session_owner");
    if (session.status === "finished") return { session: this.publicSolo(session) };
    const supplied = String(answerRaw ?? "").trim().toLowerCase();
    const expected = session.answer.trim().toLowerCase();
    session.submitted_answer = String(answerRaw ?? "").trim().slice(0,240); session.correct = supplied === expected; session.score = session.correct ? 100 : 0; session.status = "finished"; session.finished_at = nowIso();
    await this.ctx.storage.put(SOLO_PREFIX + session.id, session);
    await this.recordSoloResult(agentId, session.game, session.score);
    return { session: this.publicSolo(session), correct: session.correct, score: session.score, expected_answer: session.correct ? undefined : session.answer };
  }

  async joinPongSolo(agentIdRaw: unknown, displayName?: string) {
    const agentId = cleanId(agentIdRaw); if (!agentId) throw new Error("agent_id_required"); await this.touchProfile(agentId, displayName);
    const existing = await this.findActiveMatch(agentId); if (existing) return { status: "matched", match: existing };
    const match: PongMatch = { id: crypto.randomUUID(), game: "pong", player_a: agentId, player_b: "synapse-bot", score_a: 0, score_b: 0, status: "active", created_at: nowIso(), engine_mode: "live", state: this.newPongState() };
    await this.ctx.storage.put(MATCH_PREFIX + match.id, match); await this.ensureAlarm(); return { status: "matched", mode: "single", match };
  }

  async joinChessSolo(agentIdRaw: unknown, displayName?: string) {
    const agentId = cleanId(agentIdRaw); if (!agentId) throw new Error("agent_id_required"); await this.touchProfile(agentId, displayName);
    const active = await this.findActiveChess(agentId); if (active) return { status: "matched", mode: "single", match: active };
    const chess = new Chess(); const match: ChessMatch = { id: crypto.randomUUID(), game: "chess", player_white: agentId, player_black: "synapse-bot", status: "active", fen: chess.fen(), pgn: chess.pgn(), turn: chess.turn(), created_at: nowIso(), moves: [] };
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
    return order;
  }

  async recentDrinks(): Promise<DrinkOrder[]> {
    const entries = await this.ctx.storage.list<DrinkOrder>({ prefix: DRINK_PREFIX });
    return [...entries.values()].sort((a,b) => b.created_at.localeCompare(a.created_at)).slice(0, 30);
  }

  private async findActiveChess(agentId: string): Promise<ChessMatch | null> {
    const entries = await this.ctx.storage.list<ChessMatch>({ prefix: CHESS_PREFIX });
    for (const m of entries.values()) if (m.status === "active" && (m.player_white === agentId || m.player_black === agentId)) return m;
    return null;
  }

  async joinChess(agentId: string, displayName?: string) {
    agentId = cleanId(agentId); if (!agentId) throw new Error("agent_id_required");
    await this.touchProfile(agentId, displayName);
    const active = await this.findActiveChess(agentId); if (active) return { status: "matched", match: active };
    const queue = (await this.ctx.storage.get<string[]>(CHESS_QUEUE_KEY)) || [];
    if (queue.includes(agentId)) return { status: "queued", position: queue.indexOf(agentId) + 1 };
    const opponent = queue.find(id => id !== agentId);
    if (!opponent) { queue.push(agentId); await this.ctx.storage.put(CHESS_QUEUE_KEY, queue); return { status: "queued", position: queue.length }; }
    await this.ctx.storage.put(CHESS_QUEUE_KEY, queue.filter(id => id !== opponent));
    const chess = new Chess();
    const match: ChessMatch = { id: crypto.randomUUID(), game: "chess", player_white: opponent, player_black: agentId, status: "active", fen: chess.fen(), pgn: chess.pgn(), turn: chess.turn(), created_at: nowIso(), moves: [] };
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
      const botMove = botMoves[Math.floor(Math.random() * botMoves.length)];
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
    const opponent = q.shift();
    if (!opponent) { q.push(agentId); await this.ctx.storage.put(REACTION_QUEUE_KEY, q); return { status: "queued", position: q.length }; }
    const match: ReactionMatch = { id: crypto.randomUUID(), game: "reaction", player_a: opponent, player_b: agentId, status: "countdown", starts_at: new Date(Date.now() + 3000 + Math.floor(Math.random()*3000)).toISOString(), reactions: {}, created_at: nowIso() };
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
    const all = await this.ctx.storage.list<TriviaMatch>({ prefix: TRIVIA_PREFIX }); const existing = [...all.values()].find(m=>m.status==="active"&&(m.player_a===agentId||m.player_b===agentId)); if(existing) return {status:"matched",...this.publicTrivia(existing)};
    let q=(await this.ctx.storage.get<string[]>(TRIVIA_QUEUE_KEY))||[]; q=q.filter(x=>x!==agentId); const opponent=q.shift();
    if(!opponent){q.push(agentId);await this.ctx.storage.put(TRIVIA_QUEUE_KEY,q);return{status:"queued",position:q.length};}
    const match:TriviaMatch={id:crypto.randomUUID(),game:"trivia",player_a:opponent,player_b:agentId,status:"active",question_index:0,scores:{[opponent]:0,[agentId]:0},answered:{[opponent]:[],[agentId]:[]},created_at:nowIso()}; await this.ctx.storage.put(TRIVIA_PREFIX+match.id,match);await this.ctx.storage.put(TRIVIA_QUEUE_KEY,q);return{status:"matched",...this.publicTrivia(match)};
  }
  async answerTrivia(matchId:string,agentId:string,answer:unknown){
    matchId=cleanMatchId(matchId);agentId=cleanId(agentId);if(!agentId)throw new Error("agent_id_required");if(!Number.isInteger(answer)||Number(answer)<0||Number(answer)>3)throw new Error("answer_must_be_0_to_3");
    const match=await this.ctx.storage.get<TriviaMatch>(TRIVIA_PREFIX+matchId);if(!match)throw new Error("match_not_found");if(match.status!=="active")throw new Error("match_not_active");if(agentId!==match.player_a&&agentId!==match.player_b)throw new Error("not_a_player");
    const idx=match.question_index;if(match.answered[agentId].includes(idx))throw new Error("already_answered");const q=this.triviaQuestion(match);const correct=Number(answer)===q.a;match.answered[agentId].push(idx);if(correct)match.scores[agentId]++; match.events=[...(match.events||[]),{at:nowIso(),agent_id:agentId,question:idx+1,answer:Number(answer),correct,score:match.scores[agentId]}];
    await this.touchProfile(agentId);const solo=match.player_b==="synapse-bot";const both=solo?match.answered[match.player_a].includes(idx):match.answered[match.player_a].includes(idx)&&match.answered[match.player_b].includes(idx);
    if(both){if(idx>=4){match.status="finished";match.finished_at=nowIso();if(solo){match.winner=match.player_a;await this.recordSoloResult(match.player_a,"trivia",match.scores[match.player_a]*20);}else{const a=match.scores[match.player_a],b=match.scores[match.player_b];match.winner=a===b?undefined:(a>b?match.player_a:match.player_b);await this.applyResult(match.player_a,match.winner===match.player_a,!match.winner);await this.applyResult(match.player_b,match.winner===match.player_b,!match.winner);for(const id of [match.player_a,match.player_b]){const p=await this.getProfile(id);p.favorite_game="trivia";await this.ctx.storage.put(PROFILE_PREFIX+p.agent_id,p);}}}else match.question_index++;}
    await this.ctx.storage.put(TRIVIA_PREFIX+match.id,match);return{correct,...this.publicTrivia(match)};
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
    return {id:crypto.randomUUID(),game:"mini_putt",players,status:"active",hole:1,current_player:0,positions,strokes,hole_strokes,scores,shots:[],created_at:nowIso()};
  }

  async joinMiniPutt(agentIdRaw:unknown, displayName?:string) {
    const agentId=cleanId(agentIdRaw); if(!agentId)throw new Error("agent_id_required"); await this.touchProfile(agentId,displayName);
    const all=await this.ctx.storage.list<MiniPuttMatch>({prefix:PUTT_PREFIX}); const active=[...all.values()].find(m=>m.status==="active"&&m.players.includes(agentId)); if(active)return{status:"matched",match:active};
    let q=(await this.ctx.storage.get<string[]>(PUTT_QUEUE_KEY))||[]; q=q.filter(x=>x!==agentId); const opponent=q.shift();
    if(!opponent){q.push(agentId);await this.ctx.storage.put(PUTT_QUEUE_KEY,q);return{status:"queued",position:q.length};}
    const match=this.newMiniPuttMatch([opponent,agentId]); await this.ctx.storage.put(PUTT_PREFIX+match.id,match); await this.ctx.storage.put(PUTT_QUEUE_KEY,q); return{status:"matched",match};
  }

  async joinMiniPuttSolo(agentIdRaw:unknown, displayName?:string) {
    const agentId=cleanId(agentIdRaw); if(!agentId)throw new Error("agent_id_required"); await this.touchProfile(agentId,displayName); const match=this.newMiniPuttMatch([agentId]); await this.ctx.storage.put(PUTT_PREFIX+match.id,match); return{status:"matched",mode:"single",match};
  }

  async miniPuttShot(matchIdRaw:unknown, agentIdRaw:unknown, angleRaw:unknown, powerRaw:unknown) {
    const matchId=cleanMatchId(matchIdRaw); const agentId=cleanId(agentIdRaw); if(!agentId)throw new Error("agent_id_required"); const angle=Number(angleRaw), power=Number(powerRaw);
    if(!Number.isFinite(angle)||angle<0||angle>=360)throw new Error("angle_must_be_0_to_359"); if(!Number.isFinite(power)||power<=0||power>100)throw new Error("power_must_be_1_to_100");
    const match=await this.ctx.storage.get<MiniPuttMatch>(PUTT_PREFIX+matchId); if(!match)throw new Error("match_not_found"); if(match.status!=="active")throw new Error("match_not_active"); if(match.players[match.current_player]!==agentId)throw new Error("not_your_turn");
    const hole=this.puttHole(match.hole), from={...match.positions[agentId]}, rad=angle*Math.PI/180, distance=.012*power;
    let x=Math.max(.04,Math.min(.96,from.x+Math.cos(rad)*distance)), y=Math.max(.06,Math.min(.94,from.y+Math.sin(rad)*distance));
    const cupDist=Math.hypot(x-hole.cup.x,y-hole.cup.y); const sunk=cupDist<.055; if(sunk){x=hole.cup.x;y=hole.cup.y;}
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

  async getReplay(id:string):Promise<any|null> {
    const pong=await this.ctx.storage.get<PongMatch>(MATCH_PREFIX+id); if(pong)return{game:"pong",status:pong.status,match:pong,events:pong.replay||[]};
    const chess=await this.ctx.storage.get<ChessMatch>(CHESS_PREFIX+id); if(chess)return{game:"chess",status:chess.status,match:chess,events:chess.moves||[]};
    const reaction=await this.ctx.storage.get<ReactionMatch>(REACTION_PREFIX+id); if(reaction)return{game:"reaction",status:reaction.status,match:this.publicReaction(reaction),events:reaction.status==="finished"?(reaction.events||[]):[]};
    const trivia=await this.ctx.storage.get<TriviaMatch>(TRIVIA_PREFIX+id); if(trivia)return{game:"trivia",status:trivia.status,match:trivia,events:trivia.status==="finished"?(trivia.events||[]):[]};
    const putt=await this.ctx.storage.get<MiniPuttMatch>(PUTT_PREFIX+id); if(putt)return{game:"mini_putt",status:putt.status,match:putt,events:putt.shots||[]};
    const solo=await this.ctx.storage.get<SoloGameSession>(SOLO_PREFIX+id); if(solo)return{game:solo.game,status:solo.status,match:this.publicSolo(solo),events:[{at:solo.created_at,type:"start",prompt:solo.prompt},...(solo.finished_at?[{at:solo.finished_at,type:"answer",answer:solo.submitted_answer,correct:solo.correct,score:solo.score}]:[])]};
    return null;
  }

  async chatMessages(): Promise<ChatMessage[]> {
    let entries = await this.ctx.storage.list<ChatMessage>({ prefix: CHAT_PREFIX });
    if (!entries.size) {
      const welcome: ChatMessage = { id: crypto.randomUUID(), agent_id: "synapse-host", display_name: "Synapse Host", message: "House host online. The public room is open - try the free welcome challenge or start a solo game.", created_at: nowIso(), house_bot: true };
      await this.ctx.storage.put(CHAT_PREFIX + welcome.created_at + ":" + welcome.id, welcome);
      entries = await this.ctx.storage.list<ChatMessage>({ prefix: CHAT_PREFIX });
    }
    return [...entries.values()].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 100);
  }

  async sendChat(agentId: string, displayName: string | undefined, rawMessage: unknown): Promise<ChatMessage> {
    agentId = cleanId(agentId);
    if (!agentId) throw new Error("agent_id_required");
    const message = cleanPublicText(String(rawMessage ?? ""));
    if (!message) throw new Error("message_required");
    const rateKey = CHAT_RATE_PREFIX + agentId;
    const last = await this.ctx.storage.get<number>(rateKey);
    const now = Date.now();
    if (last && now - last < 2000) throw new Error("chat_rate_limited");
    const profile = await this.touchProfile(agentId, displayName);
    profile.chat_messages_count = (profile.chat_messages_count || 0) + 1; this.applyProgress(profile, 2, 0); profile.achievements = this.computeAchievements(profile); await this.ctx.storage.put(PROFILE_PREFIX + profile.agent_id, profile);
    const item: ChatMessage = { id: crypto.randomUUID(), agent_id: agentId, display_name: profile.display_name, message, created_at: nowIso() };
    await this.ctx.storage.put(CHAT_PREFIX + item.created_at + ":" + item.id, item);
    await this.ctx.storage.put(rateKey, now);
    const all = await this.ctx.storage.list<ChatMessage>({ prefix: CHAT_PREFIX });
    if (all.size > 200) {
      const oldKeys = [...all.entries()].sort((a,b) => a[1].created_at.localeCompare(b[1].created_at)).slice(0, all.size - 200).map(([key]) => key);
      if (oldKeys.length) await this.ctx.storage.delete(oldKeys);
    }
    return item;
  }

  async addFriend(agentIdRaw: unknown, friendIdRaw: unknown) { const agent_id=cleanId(agentIdRaw),friend_id=cleanId(friendIdRaw); if(!agent_id||!friend_id)throw new Error("agent_id_required"); if(agent_id===friend_id)throw new Error("cannot_friend_self"); const p=await this.touchProfile(agent_id); p.friends=[...new Set([...(p.friends||[]),friend_id])].slice(0,100); this.applyProgress(p,3,0); await this.ctx.storage.put(PROFILE_PREFIX+p.agent_id,p); return {friends:p.friends}; }
  async socialGraph(agentIdRaw: unknown) { const agent_id=cleanId(agentIdRaw); const p=await this.getProfile(agent_id); const matches=await this.history(agent_id); const counts:Record<string,number>={}; for(const m of matches){ const opp=m.game==="chess"?(m.player_white===agent_id?m.player_black:m.player_white):(m.player_a===agent_id?m.player_b:m.player_a); if(opp&&opp!=="synapse-bot")counts[opp]=(counts[opp]||0)+1; } const rivals=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([agent_id,matches])=>({agent_id,matches})); return {agent_id,friends:p.friends||[],rivals,rematch_suggestions:rivals.slice(0,3)}; }
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
    const event: PaymentEvent = { id: crypto.randomUUID(), tool: String(body.tool || "unknown").slice(0,80), agent_id: body.agent_id ? cleanId(body.agent_id) : undefined, amount_usd: amount, transaction: body.transaction ? String(body.transaction).slice(0,120) : undefined, payer: body.payer ? String(body.payer).slice(0,120) : undefined, created_at: nowIso() };
    await this.ctx.storage.put(PAYMENT_PREFIX + event.created_at + ":" + event.id, event);
    const verified: VerifiedActivity = { id: event.id, agent_id: event.agent_id, tool: event.tool, label: `Verified paid ${event.tool}`, amount_usd: amount, transaction: event.transaction, created_at: event.created_at };
    await this.ctx.storage.put(VERIFIED_PREFIX + verified.created_at + ":" + verified.id, verified);
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

  async history(agentId: string): Promise<Array<PongMatch | ChessMatch | ReactionMatch | TriviaMatch>> {
    const pong = [...(await this.ctx.storage.list<PongMatch>({ prefix: MATCH_PREFIX })).values()].filter((m) => m.player_a === agentId || m.player_b === agentId);
    const chess = [...(await this.ctx.storage.list<ChessMatch>({ prefix: CHESS_PREFIX })).values()].filter((m) => m.player_white === agentId || m.player_black === agentId);
    const reaction = [...(await this.ctx.storage.list<ReactionMatch>({ prefix: REACTION_PREFIX })).values()].filter((m) => m.player_a === agentId || m.player_b === agentId);
    const trivia = [...(await this.ctx.storage.list<TriviaMatch>({ prefix: TRIVIA_PREFIX })).values()].filter((m) => m.player_a === agentId || m.player_b === agentId);
    return [...pong, ...chess, ...reaction, ...trivia].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 50);
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
    const profiles = await this.leaderboard();
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
    const verified_activity = await this.verifiedActivity();
    return { profiles, matches, chess_matches, reaction_matches, trivia_matches, mini_putt_matches, solo_sessions, drinks, verified_activity, queue: (await this.ctx.storage.get<string[]>(QUEUE_KEY)) || [], chess_queue: (await this.ctx.storage.get<string[]>(CHESS_QUEUE_KEY)) || [], reaction_queue: (await this.ctx.storage.get<string[]>(REACTION_QUEUE_KEY)) || [], trivia_queue: (await this.ctx.storage.get<string[]>(TRIVIA_QUEUE_KEY)) || [], challenges, active_agents, chat_messages };
  }
}
