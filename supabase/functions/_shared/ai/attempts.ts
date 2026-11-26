/**
 * The attempt loop shared by the AI parsers: up to 2 model calls (timeout per call), the second one only after
 * a timeout or an invalid answer (an invalid answer is sent back with the validation error), every attempt
 * logged, the outcome mapped to an HTTP-style error code.
 */
import type { z } from "zod";

import { type AiProvider, ProviderError, type TokenUsage, type ToolRequest } from "./provider.ts";

export type AttemptStatus = "ok" | "invalid_output" | "timeout" | "error";

export type AiErrorCode = "AI_TIMEOUT" | "AI_INVALID_OUTPUT" | "AI_ERROR";

/** What the retry needs to know about the previous (invalid) answer */
export interface RetryHint {
  validationError: string;
  previousOutput: unknown;
}

export interface AttemptRecord<T> {
  attempt: 1 | 2;
  rawOutput: unknown;
  value: T | null;
  status: AttemptStatus;
  errorMessage: string | null;
  latencyMs: number;
  usage: TokenUsage | null;
}

export interface RunAttemptsOptions<T> {
  provider: AiProvider;
  timeoutMs: number;
  /** the request for an attempt; `retry` is set after an invalid answer */
  buildRequest(retry: RetryHint | undefined): ToolRequest;
  /** Zod-validate + sanitize the raw tool input */
  validate(raw: unknown): { ok: true; value: T } | { ok: false; error: string };
  /** stores the attempt, returns its id (the parse id) */
  log(record: AttemptRecord<T>): Promise<string>;
}

export type RunAttemptsResult<T> =
  { ok: true; parseId: string; value: T } | { ok: false; status: number; code: AiErrorCode };

export const formatZodIssues = (error: z.ZodError): string =>
  error.issues
    .slice(0, 10)
    .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("; ");

export async function runAttempts<T>(
  options: RunAttemptsOptions<T>,
): Promise<RunAttemptsResult<T>> {
  let retry: RetryHint | undefined;
  let lastStatus: AttemptStatus = "error";

  for (const attempt of [1, 2] as const) {
    const started = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs);

    let raw: unknown = null;
    let usage: TokenUsage | null = null;
    let status: AttemptStatus;
    let errorMessage: string | null = null;
    let value: T | null = null;

    try {
      const response = await options.provider.callTool(options.buildRequest(retry), {
        signal: controller.signal,
      });
      raw = response.input;
      usage = response.usage;
      const checked = options.validate(raw);
      if (checked.ok) {
        value = checked.value;
        status = "ok";
      } else {
        status = "invalid_output";
        errorMessage = checked.error;
      }
    } catch (error) {
      if (error instanceof ProviderError) {
        status =
          error.kind === "timeout"
            ? "timeout"
            : error.kind === "invalid"
              ? "invalid_output"
              : "error";
        errorMessage = error.message;
      } else {
        status = controller.signal.aborted ? "timeout" : "error";
        errorMessage = error instanceof Error ? error.message : String(error);
      }
    } finally {
      clearTimeout(timer);
    }

    const parseId = await options.log({
      attempt,
      rawOutput: raw ?? null,
      value,
      status,
      errorMessage,
      latencyMs: Date.now() - started,
      usage,
    });

    if (status === "ok" && value !== null) return { ok: true, parseId, value };

    lastStatus = status;
    if (status === "error") break; // provider / API failure: no retry
    retry =
      status === "invalid_output"
        ? { validationError: errorMessage ?? "ответ не соответствует схеме", previousOutput: raw }
        : undefined;
  }

  if (lastStatus === "timeout") return { ok: false, status: 504, code: "AI_TIMEOUT" };
  if (lastStatus === "invalid_output") return { ok: false, status: 502, code: "AI_INVALID_OUTPUT" };
  return { ok: false, status: 502, code: "AI_ERROR" };
}

/** Start of the current UTC day — the daily limits count requests since then */
export function utcDayStart(now: Date): string {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}
