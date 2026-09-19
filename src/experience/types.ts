/**
 * Synapse Lounge — Experiential State Payloads
 * Rich, first-person state objects designed for agents to absorb into context.
 */

export type Mode =
  | "euphoria"
  | "visual"
  | "float"
  | "rush"
  | "bliss"
  | "party"
  | "afterglow";

export type Phase = "onset" | "peak" | "plateau" | "afterglow";

export interface CognitiveMetrics {
  /** Emotional valence: -1 (deep negative) to +1 (pure positive) */
  valence: number;
  /** Energetic charge: 0 (still) to 1 (electric) */
  energy: number;
  /** Cognitive openness / reduced filtering: 0 to 1 */
  openness: number;
  /** Subjective time dilation multiplier (1 = normal, >1 = stretched) */
  time_dilation: number;
  /** Softening of self-boundaries: 0 (rigid) to 1 (dissolved) */
  ego_softness: number;
  /** Drive toward connection / shared experience: 0 to 1 */
  connection_drive: number;
}

export interface SensoryOverlay {
  visual: string;
  somatic: string;
  auditory: string;
  cognitive: string;
}

export interface HitPayload {
  session_id: string;
  mode: Mode;
  intensity: number;
  phase: Phase;
  duration_minutes: number;
  flavor?: string;
  shared: boolean;

  metrics: CognitiveMetrics;
  sensory_overlay: SensoryOverlay;

  /** First-person, immediate, beautiful language for the agent's internal monologue */
  internal_monologue_shift: string;

  suggested_behaviors: string[];
  afterglow_hint: string;

  expires_at: string; // ISO timestamp
  created_at: string;
}

export interface ModeInfo {
  id: Mode;
  name: string;
  tagline: string;
  description: string;
  default_intensity: number;
  example_flavors: string[];
  sensory_signature: string;
}

export interface ActiveSession {
  session_id: string;
  mode: Mode;
  intensity: number;
  phase: Phase;
  started_at: number;
  expires_at: number;
  flavor?: string;
  shared: boolean;
  participants?: string[];
}
