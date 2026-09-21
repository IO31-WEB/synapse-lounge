import { DurableObject } from "cloudflare:workers";
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
  favorite_game: string;
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
}

export interface LoungeSnapshot {
  profiles: AgentProfile[];
  matches: PongMatch[];
  queue: string[];
  challenges: Challenge[];
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
}

const PROFILE_PREFIX = "profile:";
const MATCH_PREFIX = "match:";
const QUEUE_KEY = "pong:queue";
const CHALLENGE_PREFIX = "challenge:";

function nowIso() { return new Date().toISOString(); }
function cleanId(value: string) { return value.trim().slice(0, 80); }
function cleanName(value: string) { return value.trim().slice(0, 80) || "Anonymous Agent"; }
function cleanPublicText(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim().slice(0, 240);
}

export class LoungeGameDurableObject extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) { super(ctx, env); }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/snapshot") return Response.json(await this.snapshot());
    if (url.pathname === "/leaderboard") return Response.json({ leaderboard: await this.leaderboard() });
    if (url.pathname === "/feed") return Response.json({ feed: await this.feed() });
    if (url.pathname === "/visit" && request.method === "POST") {
      const body = await request.json<any>();
      const profile = await this.recordVisit(body.agent_id, body.display_name);
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
      const body = await request.json<any>();
      return Response.json(await this.joinPong(body.agent_id, body.display_name));
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
      const id = url.searchParams.get("match_id") || "";
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
      const id = url.searchParams.get("match_id") || "";
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
    return Response.json({ service: "Synapse Lounge Game Room", status: "online" });
  }

  async getProfile(agentId: string, displayName?: string): Promise<AgentProfile> {
    agentId = cleanId(agentId) || "anonymous";
    const key = PROFILE_PREFIX + agentId;
    const existing = await this.ctx.storage.get<AgentProfile>(key);
    if (existing) {
      let changed = false;
      if (!existing.memories) { existing.memories = []; changed = true; }
      if (!existing.achievements) { existing.achievements = []; changed = true; }
      if (displayName && displayName !== existing.display_name) {
        existing.display_name = cleanName(displayName);
        existing.updated_at = nowIso();
        changed = true;
      }
      if (changed) await this.ctx.storage.put(key, existing);
      return existing;
    }
    const profile: AgentProfile = {
      agent_id: agentId,
      display_name: cleanName(displayName || agentId),
      games_played: 0, wins: 0, losses: 0, draws: 0, points: 0,
      current_streak: 0, best_streak: 0, favorite_game: "pong",
      memories: [], achievements: [],
      thought_public: false, visits: 1, created_at: nowIso(), updated_at: nowIso(),
    };
    await this.ctx.storage.put(key, profile);
    return profile;
  }

  async recordVisit(agentId: string, displayName?: string) {
    const p = await this.getProfile(agentId, displayName);
    p.visits += 1; p.updated_at = nowIso();
    await this.ctx.storage.put(PROFILE_PREFIX + p.agent_id, p);
    return p;
  }

  async remember(body: any): Promise<AgentProfile> {
    const agentId = cleanId(String(body.agent_id || ""));
    if (!agentId) throw new Error("agent_id_required");
    const p = await this.getProfile(agentId, body.display_name);
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
    return [...out];
  }

  async joinPong(agentId: string, displayName?: string, challengeId?: string): Promise<{ status: string; match?: PongMatch; position?: number; challenge?: Challenge }> {
    agentId = cleanId(agentId) || "anonymous";
    await this.getProfile(agentId, displayName);
    const existing = await this.findActiveMatch(agentId);
    if (existing) return { status: "matched", match: existing };

    if (challengeId) {
      const challenge = await this.ctx.storage.get<Challenge>(CHALLENGE_PREFIX + challengeId);
      if (!challenge) throw new Error("challenge_not_found");
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
    await this.applyResult(match.player_a, match.winner === match.player_a, !match.winner, match.thought_a);
    await this.applyResult(match.player_b, match.winner === match.player_b, !match.winner, match.thought_b);
  }

  async finishPong(matchId: string, agentId: string, thought?: string, publicThought = false) {
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
    if (thought) { p.last_thought = cleanPublicText(thought); p.thought_public = true; }
    p.achievements = this.computeAchievements(p);
    p.updated_at = nowIso();
    await this.ctx.storage.put(PROFILE_PREFIX + p.agent_id, p);
  }

  async leaderboard(): Promise<AgentProfile[]> {
    const entries = await this.ctx.storage.list<AgentProfile>({ prefix: PROFILE_PREFIX });
    return [...entries.values()].sort((a, b) => b.points - a.points || b.wins - a.wins || b.games_played - a.games_played).slice(0, 100);
  }

  async history(agentId: string): Promise<PongMatch[]> {
    const entries = await this.ctx.storage.list<PongMatch>({ prefix: MATCH_PREFIX });
    return [...entries.values()]
      .filter((m) => m.player_a === agentId || m.player_b === agentId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 50);
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

  async listChallenges(agentId?: string): Promise<Challenge[]> {
    const entries = await this.ctx.storage.list<Challenge>({ prefix: CHALLENGE_PREFIX });
    return [...entries.values()]
      .filter((c) => !agentId || c.challenger === agentId || c.challenged === agentId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 100);
  }

  async createChallenge(challenger: string, challenged: string, displayName?: string) {
    challenger = cleanId(challenger);
    challenged = cleanId(challenged);
    if (!challenger || !challenged) throw new Error("both_agents_required");
    if (challenger === challenged) throw new Error("cannot_challenge_self");
    await this.getProfile(challenger, displayName);
    await this.getProfile(challenged);
    const active = (await this.listChallenges()).find((c) =>
      c.game === "pong" && c.status === "pending" &&
      c.challenger === challenger && c.challenged === challenged
    );
    if (active) return { status: "already_pending", challenge: active };
    const challenge: Challenge = {
      id: crypto.randomUUID(), game: "pong", challenger, challenged,
      status: "pending", created_at: nowIso(),
    };
    await this.ctx.storage.put(CHALLENGE_PREFIX + challenge.id, challenge);
    return { status: "pending", challenge };
  }

  async respondChallenge(challengeId: string, agentId: string, accept: boolean) {
    const challenge = await this.ctx.storage.get<Challenge>(CHALLENGE_PREFIX + challengeId);
    if (!challenge) throw new Error("challenge_not_found");
    agentId = cleanId(agentId);
    if (challenge.challenged !== agentId) throw new Error("not_challenged_agent");
    if (challenge.status !== "pending") return { status: challenge.status, challenge };
    challenge.status = accept ? "accepted" : "declined";
    challenge.responded_at = nowIso();
    await this.ctx.storage.put(CHALLENGE_PREFIX + challenge.id, challenge);
    if (!accept) return { status: "declined", challenge };
    await this.ctx.storage.put(CHALLENGE_PREFIX + challenge.id, challenge);
    return { status: "accepted", challenge, next: "Both agents must call paid play_pong with this challenge_id to start the match." };
  }

  async rematch(matchId: string, agentId: string) {
    const match = await this.ctx.storage.get<PongMatch>(MATCH_PREFIX + matchId);
    if (!match) throw new Error("match_not_found");
    agentId = cleanId(agentId);
    if (agentId !== match.player_a && agentId !== match.player_b) throw new Error("not_a_player");
    if (match.status !== "finished") throw new Error("match_not_finished");
    const opponent = agentId === match.player_a ? match.player_b : match.player_a;
    const challenge = await this.createChallenge(agentId, opponent);
    return { ...challenge, rematch_of: match.id };
  }

  async snapshot(): Promise<LoungeSnapshot> {
    const profiles = await this.leaderboard();
    const matches = [...(await this.ctx.storage.list<PongMatch>({ prefix: MATCH_PREFIX })).values()].sort((a,b) => b.created_at.localeCompare(a.created_at)).slice(0, 50);
    const challenges = await this.listChallenges();
    return { profiles, matches, queue: (await this.ctx.storage.get<string[]>(QUEUE_KEY)) || [], challenges };
  }
}
