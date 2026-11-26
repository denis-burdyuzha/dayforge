/** Error mapping of the AI day report API (no Supabase client here — importable in tests). */
import { readFunctionError, readRpcError } from "@/shared/api/supabase/aiApiErrors";

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

/** functions.invoke error → DayReportError (HTTP body is `{ error: { code, message } }`) */
export async function mapFunctionError(error: unknown): Promise<DayReportError> {
  const info = await readFunctionError(error, KNOWN_CODES, "AI_ERROR");
  return new DayReportError(info.code as DayReportErrorCode, info.message);
}

/** PostgREST error of apply_day_report → DayReportError (code in `message`, JSON in `details`) */
export function mapRpcError(error: { message: string; details?: string | null }): DayReportError {
  const info = readRpcError(error, KNOWN_CODES);
  return new DayReportError(info.code as DayReportErrorCode, info.message, info.details);
}
