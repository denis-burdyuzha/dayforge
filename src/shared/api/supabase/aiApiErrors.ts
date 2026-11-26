/**
 * Reading errors of the AI Edge Functions (`{ error: { code, message } }` bodies) and of RPCs that raise
 * `MESSAGE = <code>, DETAIL = <json>` — shared by the AI report and the AI plan. No Supabase client here, so
 * it can be imported in tests.
 */
import { FunctionsFetchError, FunctionsHttpError } from "@supabase/supabase-js";

export interface ApiErrorInfo {
  /** one of `known`, "NETWORK", or the fallback / "UNKNOWN" */
  code: string;
  message: string;
  details: Record<string, unknown> | null;
}

const isNetworkMessage = (message: string) =>
  /failed to fetch|networkerror|network request failed|fetch failed|load failed/i.test(message);

const NETWORK: ApiErrorInfo = { code: "NETWORK", message: "Нет соединения", details: null };

/** functions.invoke error → code from the body (unknown codes → `fallback`), fetch failure → NETWORK */
export async function readFunctionError(
  error: unknown,
  known: readonly string[],
  fallback: string,
): Promise<ApiErrorInfo> {
  if (error instanceof FunctionsHttpError) {
    const response = error.context as Response | undefined;
    try {
      const body = (await response?.json()) as
        { error?: { code?: unknown; message?: unknown } } | undefined;
      const raw = body?.error?.code;
      const code = typeof raw === "string" && known.includes(raw) ? raw : fallback;
      const message = typeof body?.error?.message === "string" ? body.error.message : error.message;
      return { code, message, details: null };
    } catch {
      return { code: fallback, message: error.message, details: null };
    }
  }
  if (error instanceof FunctionsFetchError) return NETWORK;
  const message = error instanceof Error ? error.message : String(error);
  if (isNetworkMessage(message)) return NETWORK;
  return { code: fallback, message, details: null };
}

/** PostgREST error → code from `message` (unknown → "UNKNOWN"), JSON `details`; network → NETWORK */
export function readRpcError(
  error: { message: string; details?: string | null },
  known: readonly string[],
): ApiErrorInfo {
  if (isNetworkMessage(error.message)) return NETWORK;
  let details: Record<string, unknown> | null = null;
  if (error.details) {
    try {
      const parsed: unknown = JSON.parse(error.details);
      if (parsed && typeof parsed === "object") details = parsed as Record<string, unknown>;
    } catch {
      details = null;
    }
  }
  const raw = error.message.trim();
  return { code: known.includes(raw) ? raw : "UNKNOWN", message: error.message, details };
}
