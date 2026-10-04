import type { RequestContext } from "../contracts/commands.ts";
/** Real consumer adapter belongs to S07. Synthetic identities live in tests only. */
export interface IdentityPort { resolveSubject(context: RequestContext): Promise<string | null> }
