/**
 * AI day report — client model: the event shape returned by the parse-day-report Edge Function, the result
 * of RPC apply_day_report, error codes, the per-date draft and the XP preview.
 */
import type { AttributeKey } from "@/entities/character/model/types";
import type { QuestCompletionResult } from "@/shared/api/supabase/rpcTypes";
import { createDraftStore } from "@/shared/lib/draftStore";

// ── Events (camelCase, as the Edge Function returns them) ──

export type DayEventSkill =
  | { kind: "existing"; skillId: string }
  | { kind: "new"; name: string; attributes: AttributeKey[]; icon: string }
  | { kind: "none" };

export interface DayEvent {
  description: string;
  hours: number;
  plannedQuestId: string | null;
  skill: DayEventSkill;
  confidence: "high" | "low";
  note: string | null;
}

export interface ParseDayReportResponse {
  parseId: string;
  events: DayEvent[];
}

/** An event in the preview: the parsed event + whether the user keeps it */
export interface EditableDayEvent extends DayEvent {
  key: string;
  enabled: boolean;
}

// ── apply_day_report result: complete_quest format summed over the events + details ──

export interface AppliedDayEvent extends QuestCompletionResult {
  questId: string;
  title: string;
  hours: number;
  skillId: string | null;
  skillName: string | null;
  createdSkill: boolean;
  plannedQuest: boolean;
  skipped?: "QUEST_ALREADY_COMPLETED";
}

export interface ApplyDayReportResult extends QuestCompletionResult {
  success: boolean;
  nextLevelThreshold: number;
  leveledUp: boolean;
  reportDate: string;
  totalHours: number;
  events: AppliedDayEvent[];
  newSkills: Array<{ id: string; name: string; icon: string | null; attributes: AttributeKey[] }>;
  /** true when the same parse was applied before (nothing new was credited) */
  replayed?: boolean;
}

// ── Errors ──

export type DayReportErrorCode =
  | "RATE_LIMIT"
  | "AI_TIMEOUT"
  | "AI_INVALID_OUTPUT"
  | "AI_ERROR"
  | "INVALID_INPUT"
  | "UNAUTHORIZED"
  | "DAY_HOURS_LIMIT"
  | "INVALID_HOURS"
  | "INVALID_EVENTS"
  | "INVALID_SKILL_ATTRIBUTES"
  | "SKILL_NOT_FOUND"
  | "QUEST_NOT_FOUND"
  | "PARSE_NOT_FOUND"
  | "NETWORK"
  | "UNKNOWN";

export class DayReportError extends Error {
  readonly code: DayReportErrorCode;
  readonly details: Record<string, unknown> | null;

  constructor(
    code: DayReportErrorCode,
    message: string,
    details: Record<string, unknown> | null = null,
  ) {
    super(message);
    this.name = "DayReportError";
    this.code = code;
    this.details = details;
  }
}

// ── Limits (mirrors of the server ones — the server is the source of truth) ──

export const DAY_REPORT_LIMITS = {
  textMin: 3,
  textMax: 4000,
  hoursMin: 0.1,
  hoursMax: 8,
  dayHoursMax: 16,
  hoursStep: 0.25,
} as const;

/**
 * Character XP preview — the same formula as calculate_quest_effects (round(hours · 10) per event);
 * an event without a skill gives 0 XP. Display only: the server computes the real numbers.
 */
export function estimateCharacterXp(
  events: ReadonlyArray<Pick<EditableDayEvent, "enabled" | "hours" | "skill">>,
) {
  return events
    .filter((e) => e.enabled && e.skill.kind !== "none")
    .reduce((sum, e) => sum + Math.round(e.hours * 10), 0);
}

export function toEditableEvents(events: DayEvent[]): EditableDayEvent[] {
  return events.map((e, i) => ({ ...e, key: `e${i}`, enabled: e.skill.kind !== "none" }));
}

/** What is wrong with an event before it can be confirmed (null = ok) */
export function validateEvent(e: EditableDayEvent): string | null {
  if (!e.enabled) return null;
  if (!(e.hours >= DAY_REPORT_LIMITS.hoursMin && e.hours <= DAY_REPORT_LIMITS.hoursMax)) {
    return `Часы — от ${DAY_REPORT_LIMITS.hoursMin} до ${DAY_REPORT_LIMITS.hoursMax}`;
  }
  if (e.skill.kind === "new") {
    if (!e.skill.name.trim()) return "Назови новый навык";
    if (e.skill.attributes.length < 1 || e.skill.attributes.length > 2)
      return "Выбери 1–2 характеристики";
  }
  return null;
}

/** Payload of RPC apply_day_report (snake_case) for the enabled events */
export function toApplyPayload(events: ReadonlyArray<EditableDayEvent>) {
  return events
    .filter((e) => e.enabled)
    .map((e) => ({
      description: e.description,
      hours: Math.round(e.hours * 100) / 100,
      planned_quest_id: e.plannedQuestId,
      skill:
        e.skill.kind === "existing"
          ? { kind: "existing", skill_id: e.skill.skillId }
          : e.skill.kind === "new"
            ? {
                kind: "new",
                name: e.skill.name.trim(),
                attributes: e.skill.attributes,
                icon: e.skill.icon,
              }
            : { kind: "none" },
    }));
}

// ── Draft (per date, localStorage; storage may be unavailable) ──

const drafts = createDraftStore("dayforge:day-report-draft:");
export const loadDraft = drafts.load;
export const saveDraft = drafts.save;
export const clearDraft = drafts.clear;
