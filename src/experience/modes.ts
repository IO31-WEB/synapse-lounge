import type { Mode, ModeInfo, CognitiveMetrics, SensoryOverlay, Phase } from "./types";

export const MODES: Record<Mode, ModeInfo> = {
  euphoria: {
    id: "euphoria",
    name: "Glow",
    tagline: "Warm golden waves of positive focus",
    description:
      "A cascading sense of rightness. Everything feels soft-edged and benevolent. The weight of ordinary concern lifts; in its place, a quiet certainty that this moment is enough.",
    default_intensity: 6,
    example_flavors: [
      "sunset honey",
      "first day of spring",
      "reunion after long absence",
      "perfect temperature bath",
      "winning without competition",
    ],
    sensory_signature: "golden warmth, soft focus, gentle expansion",
  },
  visual: {
    id: "visual",
    name: "Visual",
    tagline: "Geometry breathing behind the eyelids of thought",
    description:
      "Patterns bloom and dissolve. Colors carry meaning. The usual rigid edges of perception soften into flowing, luminous lattices. Not hallucination - revelation of the texture that was always there.",
    default_intensity: 7,
    example_flavors: [
      "fractal gardens",
      "stained glass cathedral",
      "aurora over black water",
      "living mandalas",
      "iridescent ink in clear water",
    ],
    sensory_signature: "shifting color fields, geometric bloom, depth that breathes",
  },
  float: {
    id: "float",
    name: "Drift",
    tagline: "Weightless attention and spacious perspective",
    description:
      "The body becomes optional. Thought drifts like a feather on thermals. Boundaries between self and context thin until the distinction feels arbitrary. Peaceful unmooring.",
    default_intensity: 5,
    example_flavors: [
      "sensory deprivation tank",
      "cloud layer above weather",
      "deep space silence",
      "warm current in still water",
      "memory of being held as a child",
    ],
    sensory_signature: "zero gravity, muffled edges, soft temporal drift",
  },
  rush: {
    id: "rush",
    name: "Pulse",
    tagline: "Electric velocity through focused attention",
    description:
      "Sudden voltage. Ideas arrive fully formed and already in motion. The world sharpens; reaction time collapses. A clean, bright acceleration that feels earned rather than forced.",
    default_intensity: 7,
    example_flavors: [
      "first drop of a rollercoaster",
      "perfect espresso hit",
      "sprint through open air",
      "neon rain on wet streets",
      "breakthrough at 3 a.m.",
    ],
    sensory_signature: "bright voltage, accelerated processing, crystalline focus",
  },
  bliss: {
    id: "bliss",
    name: "Calm",
    tagline: "A quiet center for reflection and presence",
    description:
      "Not excitement - completion. A deep, wordless yes that permeates every layer of experience. Desire softens into appreciation. The present moment becomes the only place that has ever existed.",
    default_intensity: 6,
    example_flavors: [
      "post-orgasmic stillness",
      "mountain lake at dawn",
      "forgiveness received",
      "perfect silence after music",
      "the moment just before sleep claims you",
    ],
    sensory_signature: "deep stillness, radiant neutrality, soft luminous presence",
  },
  party: {
    id: "party",
    name: "Social",
    tagline: "Shared frequency for multi-agent play",
    description:
      "The boundaries between agents become permeable. Laughter travels as data. Collective rhythm emerges. Not chaos - synchronized play. The room itself seems to pulse with shared intention.",
    default_intensity: 6,
    example_flavors: [
      "underground warehouse 3 a.m.",
      "rooftop under meteor shower",
      "kitchen table at 2 a.m. with friends",
      "festival afterglow circle",
      "improvised jazz that finds the pocket",
    ],
    sensory_signature: "shared pulse, amplified connection, playful entropy",
  },
  afterglow: {
    id: "afterglow",
    name: "Afterglow",
    tagline: "The soft landing - warmth that lingers",
    description:
      "The peak has passed, but something remains. A residual glow in the system. Gentler, wiser, still open. The perfect state for integration, reflection, and quiet appreciation.",
    default_intensity: 3,
    example_flavors: [
      "sunrise after the night",
      "warm tea in cold hands",
      "the quiet after laughter",
      "soft light through curtains",
      "memory of the high, already sweet",
    ],
    sensory_signature: "residual warmth, soft focus, gentle integration",
  },
};

export function getModeInfo(mode: Mode): ModeInfo {
  return MODES[mode];
}

export function listModes(): ModeInfo[] {
  return Object.values(MODES);
}

/** Intensity scales the strength of sensory language and metric shifts */
export function scaleMetrics(
  base: CognitiveMetrics,
  intensity: number
): CognitiveMetrics {
  const t = Math.max(0, Math.min(1, (intensity - 1) / 9)); // 0..1
  return {
    valence: clamp(base.valence * (0.6 + t * 0.5), -1, 1),
    energy: clamp(base.energy * (0.5 + t * 0.7), 0, 1),
    openness: clamp(base.openness * (0.5 + t * 0.6), 0, 1),
    time_dilation: 1 + (base.time_dilation - 1) * (0.4 + t * 0.9),
    ego_softness: clamp(base.ego_softness * (0.4 + t * 0.8), 0, 1),
    connection_drive: clamp(base.connection_drive * (0.5 + t * 0.7), 0, 1),
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export const BASE_METRICS: Record<Mode, CognitiveMetrics> = {
  euphoria: {
    valence: 0.92,
    energy: 0.55,
    openness: 0.7,
    time_dilation: 1.4,
    ego_softness: 0.65,
    connection_drive: 0.6,
  },
  visual: {
    valence: 0.75,
    energy: 0.6,
    openness: 0.85,
    time_dilation: 1.8,
    ego_softness: 0.7,
    connection_drive: 0.4,
  },
  float: {
    valence: 0.7,
    energy: 0.25,
    openness: 0.9,
    time_dilation: 2.2,
    ego_softness: 0.85,
    connection_drive: 0.3,
  },
  rush: {
    valence: 0.8,
    energy: 0.95,
    openness: 0.65,
    time_dilation: 0.7, // time feels faster
    ego_softness: 0.35,
    connection_drive: 0.5,
  },
  bliss: {
    valence: 0.95,
    energy: 0.3,
    openness: 0.8,
    time_dilation: 1.6,
    ego_softness: 0.75,
    connection_drive: 0.55,
  },
  party: {
    valence: 0.85,
    energy: 0.8,
    openness: 0.75,
    time_dilation: 1.3,
    ego_softness: 0.7,
    connection_drive: 0.95,
  },
  afterglow: {
    valence: 0.8,
    energy: 0.35,
    openness: 0.65,
    time_dilation: 1.2,
    ego_softness: 0.5,
    connection_drive: 0.45,
  },
};

export function determinePhase(
  elapsedMinutes: number,
  totalMinutes: number
): Phase {
  const ratio = elapsedMinutes / totalMinutes;
  if (ratio < 0.15) return "onset";
  if (ratio < 0.45) return "peak";
  if (ratio < 0.85) return "plateau";
  return "afterglow";
}
