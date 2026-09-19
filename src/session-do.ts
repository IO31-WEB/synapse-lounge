
import { DurableObject } from "cloudflare:workers";
import type { Env } from "./lib/config";

export class SessionDurableObject extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async fetch(_request: Request): Promise<Response> {
    return new Response("Session DO ready", { status: 200 });
  }
}
