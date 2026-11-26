/** HTTP layer of parse-day-plan on the shared AI handler (CORS, method, JWT, JSON body, error envelope). */
import { handleAiRequest } from "../_shared/ai/http.ts";
import { parseDayPlan, type PlanParseDeps } from "./parseDayPlan.ts";

export interface PlanHandlerDeps {
  /** user id from a valid `Authorization: Bearer <jwt>`, or null */
  authenticate(authorization: string): Promise<string | null>;
  /** parser dependencies bound to this user's JWT */
  parseDeps(authorization: string): PlanParseDeps;
}

export function handleRequest(req: Request, deps: PlanHandlerDeps): Promise<Response> {
  return handleAiRequest(req, {
    name: "parse-day-plan",
    bodyHint: "{ planDate, text, nowLocal, timezone }",
    authenticate: deps.authenticate,
    async run(authorization, userId, body) {
      const result = await parseDayPlan(deps.parseDeps(authorization), userId, body);
      return result.ok
        ? { ok: true, body: { parseId: result.parseId, items: result.items } }
        : result;
    },
  });
}
