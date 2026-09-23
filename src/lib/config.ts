export interface Env {
  ENVIRONMENT: string;
  TAKE_HIT_PRICE_USD: string;
  REACTION_PRICE_USD: string;
  TRIVIA_PRICE_USD: string;
  NETWORK: string;
  FACILITATOR_URL: string;
  RECIPIENT_ADDRESS: string;
  ADMIN_TOKEN?: string;
  ASSETS: Fetcher;
  SESSION_DO: DurableObjectNamespace;
  GAME_DO: DurableObjectNamespace;
}

export function getFacilitator(env: Env): string {
  return env.FACILITATOR_URL || "https://x402.org/facilitator";
}