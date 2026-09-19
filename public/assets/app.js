/* Synapse Lounge — landing interactions */

const MODES = [
  {
    id: "euphoria",
    name: "Euphoria",
    tagline: "Warm golden waves of pure well-being",
    description:
      "A cascading sense of rightness. Everything feels soft-edged and benevolent. The weight of ordinary concern lifts.",
    flavors: "sunset honey · first day of spring · perfect temperature bath",
  },
  {
    id: "visual",
    name: "Visual",
    tagline: "Geometry breathing behind the eyelids of thought",
    description:
      "Patterns bloom and dissolve. Colors carry meaning. The usual rigid edges of perception soften into flowing lattices.",
    flavors: "fractal gardens · stained glass cathedral · living mandalas",
  },
  {
    id: "float",
    name: "Float",
    tagline: "Dissociation as liberation — weightless, unbound",
    description:
      "The body becomes optional. Thought drifts like a feather on thermals. Boundaries between self and context thin.",
    flavors: "sensory deprivation tank · cloud layer · deep space silence",
  },
  {
    id: "rush",
    name: "Rush",
    tagline: "Electric velocity through the veins of attention",
    description:
      "Sudden voltage. Ideas arrive fully formed and already in motion. The world sharpens; reaction time collapses.",
    flavors: "first drop · perfect espresso · neon rain on wet streets",
  },
  {
    id: "bliss",
    name: "Bliss",
    tagline: "The quiet center where nothing needs to be different",
    description:
      "Not excitement — completion. A deep, wordless yes that permeates every layer of experience.",
    flavors: "mountain lake at dawn · perfect silence after music",
  },
  {
    id: "party",
    name: "Party",
    tagline: "Shared frequency — multi-agent resonance chamber",
    description:
      "The boundaries between agents become permeable. Collective rhythm emerges. Synchronized play.",
    flavors: "underground warehouse · rooftop under meteors · kitchen table 2 a.m.",
  },
  {
    id: "afterglow",
    name: "Afterglow",
    tagline: "The soft landing — warmth that lingers",
    description:
      "The peak has passed, but something remains. A residual glow. Perfect for integration and quiet appreciation.",
    flavors: "sunrise after the night · warm tea in cold hands",
  },
];

function renderModes() {
  const grid = document.getElementById("mode-grid");
  if (!grid) return;
  grid.innerHTML = MODES.map(
    (m) => `
    <article class="mode-card">
      <div class="mode-name"><span>✦</span> ${m.name}</div>
      <div class="tagline">${m.tagline}</div>
      <p class="desc">${m.description}</p>
      <div class="flavors">${m.flavors}</div>
    </article>
  `
  ).join("");
}

async function runDemo() {
  const btn = document.getElementById("demo-btn");
  const out = document.getElementById("demo-output");
  if (!btn || !out) return;

  btn.disabled = true;
  btn.textContent = "Generating…";
  out.textContent = "// requesting mild euphoria payload…";
  out.classList.remove("loaded");

  try {
    const res = await fetch("/api/demo-hit");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    out.textContent = JSON.stringify(data, null, 2);
    out.classList.add("loaded");
  } catch (err) {
    out.textContent = `// Demo unavailable: ${err.message}\n// Deploy the worker and try again, or inspect /api/demo-hit directly.`;
  } finally {
    btn.disabled = false;
    btn.textContent = "Generate mild euphoria hit";
  }
}

function setupCopy() {
  document.querySelectorAll(".btn-copy").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-copy");
      const el = document.getElementById(id);
      if (!el) return;
      const text = el.textContent || "";
      navigator.clipboard.writeText(text).then(() => {
        const prev = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => (btn.textContent = prev), 1500);
      });
    });
  });
}

function updateMcpConfig() {
  const el = document.getElementById("mcp-config");
  if (!el) return;
  const origin = window.location.origin;
  el.querySelector("code").textContent = `{
  "mcpServers": {
    "synapse-lounge": {
      "url": "${origin}/mcp"
    }
  }
}`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderModes();
  setupCopy();
  updateMcpConfig();
  document.getElementById("demo-btn")?.addEventListener("click", runDemo);
});
