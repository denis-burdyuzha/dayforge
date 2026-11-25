/** Error mapping of the AI day report API (no Supabase client here — importable in tests). */
import { FunctionsFetchError, FunctionsHttpError } from "@supabase/supabase-js";

import { DayReportError, type DayReportErrorCode } from "../model/aiDayReport";

const KNOWN_CODES: readonly DayReportErrorCode[] = [
  "RATE_LIMIT",
  "AI_TIMEOUT",
  "AI_INVALID_OUTPUT",
  "AI_ERROR",
  "INVALID_INPUT",
  "UNAUTHORIZED",
  "DAY_HOURS_LIMIT",
  "INVALID_HOURS",
  "INVALID_EVENTS",
  "INVALID_SKILL_ATTRIBUTES",
  "SKILL_NOT_FOUND",
  "QUEST_NOT_FOUND",
  "PARSE_NOT_FOUND",
];

const asCode = (value: unknown): DayReportErrorCode =>
  typeof value === "string" && (KNOWN_CODES as readonly string[]).includes(value)
    ? (value as DayReportErrorCode)
    : "UNKNOWN";

const isNetworkMessage = (message: string) =>
  /failed to fetch|networkerror|network request failed|fetch failed|load failed/i.test(message);

/** functions.invoke error → DayReportError (HTTP body is `{ error: { code, message } }`) */
export async function mapFunctionError(error: unknown): Promise<DayReportError> {
  if (error instanceof FunctionsHttpError) {
    const response = error.context as Response | undefined;
    try {
      const body = (await response?.json()) as
        { error?: { code?: unknown; message?: unknown } } | undefined;
      const code = asCode(body?.error?.code);
      const message = typeof body?.error?.message === "string" ? body.error.message : error.message;
      return new DayReportError(code === "UNKNOWN" ? "AI_ERROR" : code, message);
    } catch {
      return new DayReportError("AI_ERROR", error.message);
    }
  }
  if (error instanceof FunctionsFetchError) return new DayReportError("NETWORK", "Нет соединения");
  const message = error instanceof Error ? error.message : String(error);
  if (isNetworkMessage(message)) return new DayReportError("NETWORK", "Нет соединения");
  return new DayReportError("AI_ERROR", message);
}

/** PostgREST error of apply_day_report → DayReportError (code in `message`, JSON in `details`) */
export function mapRpcError(error: { message: string; details?: string | null }): DayReportError {
  if (isNetworkMessage(error.message)) return new DayReportError("NETWORK", "Нет соединения");
  let details: Record<string, unknown> | null = null;
  if (error.details) {
    try {
      const parsed: unknown = JSON.parse(error.details);
      if (parsed && typeof parsed === "object") details = parsed as Record<string, unknown>;
    } catch {
      details = null;
    }
  }
  return new DayReportError(asCode(error.message.trim()), error.message, details);
}
