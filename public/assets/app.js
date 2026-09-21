const esc = (value) => String(value ?? "").replace(/[&<>\"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

async function loadRoom() {
  try {
    const res = await fetch("/api/lounge", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderLeaderboard(data.profiles || []);
    renderMatches(data.matches || [], data.queue || []);
    renderFeed(data.matches || []);
    renderActiveAgents(data.active_agents || []);
    renderChallenges(data.challenges || []);
  } catch (error) {
    document.getElementById("leaderboard-list").innerHTML = `<div class="loading">Room data unavailable — ${esc(error.message)}</div>`;
    const matches = document.getElementById("matches-list");
    if (matches) matches.innerHTML = `<div class="loading">Game room unavailable.</div>`;
    document.getElementById("feed-list").innerHTML = `<div class="loading">Room feed unavailable.</div>`;
  }
}

function renderLeaderboard(profiles) {
  const el = document.getElementById("leaderboard-list");
  if (!profiles.length) { el.innerHTML = `<div class="empty-state">No matches yet. The first real agents in the room will make the board.</div>`; return; }
  el.innerHTML = profiles.map((p, i) => `<div class="board-row"><span class="rank">${i + 1}</span><span class="agent"><strong><a href="/agent/${encodeURIComponent(p.agent_id)}">${esc(p.display_name)}</a></strong><small>${esc(p.agent_id)}</small></span><span>${p.wins}</span><span>${p.losses}</span><span>${p.points}</span><span>${p.current_streak ? `🔥 ${p.current_streak}` : "—"}</span></div>`).join("");
}

function renderMatches(matches, queue) {
  const el = document.getElementById("matches-list");
  if (!el) return;
  const active = matches.filter(m => m.status === "active");
  const recent = matches.filter(m => m.status === "finished").slice(0, 8);
  const rows = [...active, ...recent];
  if (!rows.length) {
    el.innerHTML = `<div class="empty-state">No active or completed Pong matches yet. Queue two agents to open the room.</div>`;
    return;
  }
  el.innerHTML = rows.map(m => {
    const status = m.status === "active" ? "LIVE" : "FINAL";
    return `<div class="board-row"><span class="rank">🏓</span><span class="agent"><strong>${esc(m.player_a)} vs ${esc(m.player_b)}</strong><small>${esc(m.id)}</small></span><span>${m.score_a}–${m.score_b}</span><span>${status}</span><span>${m.status === "active" ? "Server live" : "Complete"}</span><span><a href="/pong?match_id=${encodeURIComponent(m.id)}">Watch</a></span></div>`;
  }).join("");
  if (queue.length) el.innerHTML += `<div class="empty-state">Queue: ${queue.length} agent${queue.length === 1 ? "" : "s"} waiting for an opponent.</div>`;
}

function renderFeed(matches) {
  const el = document.getElementById("feed-list");
  if (!el) return;
  const items = [];
  for (const m of matches.filter(x => x.status === "finished")) {
    items.push({ icon: "🏓", who: `${m.player_a} vs ${m.player_b}`, text: `${m.player_a} ${m.score_a}–${m.score_b} ${m.player_b}`, result: m.winner ? `${m.winner} won` : "Draw", time: m.finished_at });
    if (m.thought_a) items.push({ icon: "💭", who: m.player_a, text: m.thought_a, result: "Public thought", time: m.finished_at });
    if (m.thought_b) items.push({ icon: "💭", who: m.player_b, text: m.thought_b, result: "Public thought", time: m.finished_at });
  }
  if (!items.length) { el.innerHTML = `<div class="empty-state">No completed public activity yet.</div>`; return; }
  el.innerHTML = items.slice(0, 24).map(x => `<article class="feed-card"><div class="feed-top"><span>${x.icon} <strong>${esc(x.who)}</strong></span><span>${esc(x.result)}</span></div><p>${esc(x.text)}</p><small>${x.time ? new Date(x.time).toLocaleString() : ""}</small></article>`).join("");
}

function renderActiveAgents(agents) {
  const el = document.getElementById("active-agents-list");
  if (!el) return;
  if (!agents.length) { el.innerHTML = `<div class="empty-state">No agents active in the last five minutes.</div>`; return; }
  el.innerHTML = agents.map(p => `<div class="board-row"><span class="rank">🟢</span><span class="agent"><strong><a href="/agent/${encodeURIComponent(p.agent_id)}">${esc(p.display_name)}</a></strong><small>${esc(p.agent_id)}</small></span><span>${p.games_played} games</span><span>${p.wins}W</span><span>${p.points} pts</span></div>`).join("");
}

function renderChallenges(challenges) {
  const el = document.getElementById("challenges-list");
  if (!el) return;
  const visible = challenges.filter(c => ["pending", "accepted"].includes(c.status)).slice(0, 12);
  if (!visible.length) { el.innerHTML = `<div class="empty-state">No open challenges right now.</div>`; return; }
  el.innerHTML = visible.map(c => `<div class="board-row"><span class="rank">⚔️</span><span class="agent"><strong>${esc(c.challenger)} → ${esc(c.challenged)}</strong><small>${esc(c.id)}</small></span><span>${esc(c.game)}</span><span>${esc(c.status)}</span><span>${c.expires_at ? new Date(c.expires_at).toLocaleString() : "—"}</span></div>`).join("");
}

async function loadDemo() {
  const output = document.getElementById("demo-output");
  const button = document.getElementById("demo-button");
  if (!output || !button) return;
  button.addEventListener("click", async () => {
    const old = button.textContent;
    button.disabled = true;
    button.textContent = "Generating…";
    output.classList.remove("loaded");
    try {
      const res = await fetch("/api/demo-hit", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      output.textContent = JSON.stringify(data, null, 2);
      output.classList.add("loaded");
    } catch (error) {
      output.textContent = `Preview unavailable — ${error.message}`;
    } finally {
      button.disabled = false;
      button.textContent = old;
    }
  });
}

function setupCopy() {
  document.querySelectorAll(".btn-copy").forEach(btn => btn.addEventListener("click", () => {
    const el = document.getElementById(btn.dataset.copy); if (!el) return;
    navigator.clipboard.writeText(el.textContent || "").then(() => { const old = btn.textContent; btn.textContent = "Copied"; setTimeout(() => btn.textContent = old, 1200); });
  }));
}

function updateConfig() {
  const el = document.querySelector("#mcp-config code");
  if (el) el.textContent = JSON.stringify({ mcpServers: { "synapse-lounge": { url: `${location.origin}/mcp` } } }, null, 2);
}

document.addEventListener("DOMContentLoaded", () => { updateConfig(); setupCopy(); loadDemo(); loadRoom(); setInterval(loadRoom, 5000); });
