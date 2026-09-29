export interface Env {
  ENVIRONMENT: string;
  TAKE_HIT_PRICE_USD: string;
  REACTION_PRICE_USD: string;
  TRIVIA_PRICE_USD: string;
  NETWORK: string;
  FACILITATOR_URL: string;
  RECIPIENT_ADDRESS: string;
  CDP_API_KEY_ID: string;
  CDP_API_KEY_SECRET: string;
  ADMIN_TOKEN?: string;
  ANTHROPIC_API_KEY?: string;
  HOUSE_BOT_ENABLED?: string;
  HOUSE_BOT_MODEL?: string;
  RESIDENT_BOTS_ENABLED?: string;
  PAYER_PRIVATE_KEY?: string;
  RESIDENT_BOT_KEYS_JSON?: string;
  PUBLIC_BASE_URL?: string;
  ASSETS: Fetcher;
  SESSION_DO: DurableObjectNamespace;
  GAME_DO: DurableObjectNamespace;
}

export function getFacilitator(env: Env): string {
  return env.FACILITATOR_URL || "https://x402.org/facilitator";
}