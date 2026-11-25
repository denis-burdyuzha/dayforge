/** HTTP layer of parse-day-report: CORS, method, JWT auth, JSON body, status codes. */
import { parseDayReport, type ParseDeps } from "./parseDayReport.ts";
import type { ErrorCode } from "./types.ts";

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export interface HandlerDeps {
  /** user id from a valid `Authorization: Bearer <jwt>`, or null */
  authenticate(authorization: string): Promise<string | null>;
  /** parser dependencies bound to this user's JWT */
  parseDeps(authorization: string): ParseDeps;
}

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });

const error = (status: number, code: ErrorCode, message: string): Response =>
  json(status, { error: { code, message } });

export async function handleRequest(req: Request, deps: HandlerDeps): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return error(405, "METHOD_NOT_ALLOWED", "Только POST");

  const authorization = req.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return error(401, "UNAUTHORIZED", "Нужна авторизация");

  let userId: string | null;
  try {
    userId = await deps.authenticate(authorization);
  } catch {
    userId = null;
  }
  if (!userId) return error(401, "UNAUTHORIZED", "Сессия недействительна");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error(400, "INVALID_INPUT", "Тело запроса — JSON { reportDate, text }");
  }

  try {
    const result = await parseDayReport(deps.parseDeps(authorization), userId, body);
    if (result.ok) return json(200, { parseId: result.parseId, events: result.events });
    return error(result.status, result.code, result.message);
  } catch (err) {
    console.error("parse-day-report failed", err);
    return error(500, "INTERNAL", "Внутренняя ошибка");
  }
}
