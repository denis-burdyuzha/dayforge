/** Contracts of parse-day-plan: data access, context handed to the model, results. */
import type { AttemptStatus, RetryHint } from "../_shared/ai/attempts.ts";
import type { Failure } from "../_shared/ai/http.ts";
import type { TokenUsage } from "../_shared/ai/provider.ts";
import type { SkillContext } from "../_shared/ai/skills.ts";
import type { PlanItem } from "./schema.ts";

export { type AiProvider, ProviderError } from "../_shared/ai/provider.ts";
export type { SkillContext } from "../_shared/ai/skills.ts";

/** A quest already on the date (any status) — so the model does not duplicate it */
export interface ExistingQuestContext {
  id: string;
  title: string;
  startTime: string | null;
  durationMinutes: number | null;
  status: "pending" | "completed";
}

export interface PlanParseContext {
  skills: SkillContext[];
  quests: ExistingQuestContext[];
}

/** Everything the prompt is built from */
export interface PlanProviderInput {
  planDate: string;
  text: string;
  /** the plan is for the client's today → nothing before nowLocal */
  isToday: boolean;
  nowLocal: string;
  context: PlanParseContext;
  retry?: RetryHint | undefined;
}

export interface PlanAttemptLog {
  userId: string;
  planDate: string;
  inputText: string;
  model: string;
  attempt: 1 | 2;
  rawOutput: unknown;
  parsedItems: PlanItem[] | null;
  status: AttemptStatus;
  errorMessage: string | null;
  latencyMs: number;
  usage: TokenUsage | null;
}

export interface DayPlanStore {
  /** plan parse requests (attempt = 1) of the user since `sinceIso` */
  countParseRequestsSince(userId: string, sinceIso: string): Promise<number>;
  loadContext(userId: string, planDate: string): Promise<PlanParseContext>;
  /** inserts the attempt row, returns its id */
  logAttempt(log: PlanAttemptLog): Promise<string>;
}

export type PlanParseResult = { ok: true; parseId: string; items: PlanItem[] } | Failure;
