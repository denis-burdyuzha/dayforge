/** HTTP layer shared by the AI Edge Functions: CORS, method, JWT auth, JSON body, error envelope. */

export type ErrorCode =
  | "INVALID_INPUT"
  | "UNAUTHORIZED"
  | "RATE_LIMIT"
  | "AI_TIMEOUT"
  | "AI_INVALID_OUTPUT"
  | "AI_ERROR"
  | "METHOD_NOT_ALLOWED"
  | "INTERNAL";

export type Failure = { ok: false; status: number; code: ErrorCode; message: string };

export const fail = (status: number, code: ErrorCode, message: string): Failure => ({
  ok: false,
  status,
  code,
  message,
});

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });

export const errorResponse = (status: number, code: ErrorCode, message: string): Response =>
  jsonResponse(status, { error: { code, message } });

export interface AiHandlerOptions<T> {
  /** for logs and the bad-body message */
  name: string;
  bodyHint: string;
  /** user id from a valid `Authorization: Bearer <jwt>`, or null */
  authenticate(authorization: string): Promise<string | null>;
  /** the parser, bound to this user's JWT */
  run(
    authorization: string,
    userId: string,
    body: unknown,
  ): Promise<{ ok: true; body: T } | Failure>;
}

export async function handleAiRequest<T>(
  req: Request,
  options: AiHandlerOptions<T>,
): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return errorResponse(405, "METHOD_NOT_ALLOWED", "Только POST");

  const authorization = req.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    return errorResponse(401, "UNAUTHORIZED", "Нужна авторизация");
  }

  let userId: string | null;
  try {
    userId = await options.authenticate(authorization);
  } catch {
    userId = null;
  }
  if (!userId) return errorResponse(401, "UNAUTHORIZED", "Сессия недействительна");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, "INVALID_INPUT", `Тело запроса — JSON ${options.bodyHint}`);
  }

  try {
    const result = await options.run(authorization, userId, body);
    if (result.ok) return jsonResponse(200, result.body);
    return errorResponse(result.status, result.code, result.message);
  } catch (err) {
    console.error(`${options.name} failed`, err);
    return errorResponse(500, "INTERNAL", "Внутренняя ошибка");
  }
}
