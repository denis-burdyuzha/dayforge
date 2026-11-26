/** HTTP layer of parse-day-report on the shared AI handler (CORS, method, JWT, JSON body, error envelope). */
import { CORS_HEADERS, handleAiRequest } from "../_shared/ai/http.ts";
import { parseDayReport, type ParseDeps } from "./parseDayReport.ts";

export { CORS_HEADERS };

export interface HandlerDeps {
  /** user id from a valid `Authorization: Bearer <jwt>`, or null */
  authenticate(authorization: string): Promise<string | null>;
  /** parser dependencies bound to this user's JWT */
  parseDeps(authorization: string): ParseDeps;
}

export function handleRequest(req: Request, deps: HandlerDeps): Promise<Response> {
  return handleAiRequest(req, {
    name: "parse-day-report",
    bodyHint: "{ reportDate, text }",
    authenticate: deps.authenticate,
    async run(authorization, userId, body) {
      const result = await parseDayReport(deps.parseDeps(authorization), userId, body);
      return result.ok
        ? { ok: true, body: { parseId: result.parseId, events: result.events } }
        : result;
    },
  });
}
