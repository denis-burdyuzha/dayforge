/**
 * AI day plan — client model: the item shape returned by the parse-day-plan Edge Function, the result of RPC
 * apply_day_plan, error codes, validation, overlaps, the per-date draft.
 */
import type { AttributeKey } from "@/entities/character/model/types";
import { createDraftStore } from "@/shared/lib/draftStore";

// ── Items (camelCase, as the Edge Function returns them) ──

export type PlanItemSkill =
  | { kind: "existing"; skillId: string }
  | { kind: "new"; name: string; attributes: AttributeKey[]; icon: string }
  | { kind: "none" };

export interface PlanItem {
  title: string;
  /** "YYYY-MM-DD": the plan date or the next day */
  date: string;
  /** "HH:MM" or null */
  startTime: string | null;
  durationMinutes: number;
  skill: PlanItemSkill;
  duplicateOfExisting: boolean;
  confidence: "high" | "low";
  note: string | null;
}

export interface ParseDayPlanResponse {
  parseId: string;
  items: PlanItem[];
}

/** An item in the preview: the parsed item + whether the user keeps it */
export interface EditablePlanItem extends PlanItem {
  key: string;
  enabled: boolean;
}

export interface ApplyDayPlanResult {
  success: boolean;
  planId: string;
  planDate: string;
  quests: Array<{
    id: string;
    title: string;
    /** the quest's date (the plan date or the next day) */
    date?: string;
    startTime: string | null;
    durationMinutes: number;
    skillId: string | null;
    skillName: string | null;
    createdSkill: boolean;
  }>;
  newSkills: Array<{ id: string; name: string; icon: string | null; attributes: AttributeKey[] }>;
  totalMinutes: number;
  replayed?: boolean;
}

// ── Errors ──

export type DayPlanErrorCode =
  | "RATE_LIMIT"
  | "AI_TIMEOUT"
  | "AI_INVALID_OUTPUT"
  | "AI_ERROR"
  | "INVALID_INPUT"
  | "UNAUTHORIZED"
  | "PLAN_HOURS_LIMIT"
  | "INVALID_ITEMS"
  | "INVALID_DURATION"
  | "INVALID_SKILL_ATTRIBUTES"
  | "SKILL_NOT_FOUND"
  | "PARSE_NOT_FOUND"
  | "NETWORK"
  | "UNKNOWN";

export const DAY_PLAN_ERROR_CODES: readonly DayPlanErrorCode[] = [
  "RATE_LIMIT",
  "AI_TIMEOUT",
  "AI_INVALID_OUTPUT",
  "AI_ERROR",
  "INVALID_INPUT",
  "UNAUTHORIZED",
  "PLAN_HOURS_LIMIT",
  "INVALID_ITEMS",
  "INVALID_DURATION",
  "INVALID_SKILL_ATTRIBUTES",
  "SKILL_NOT_FOUND",
  "PARSE_NOT_FOUND",
];

export class DayPlanError extends Error {
  readonly code: DayPlanErrorCode;
  readonly details: Record<string, unknown> | null;

  constructor(
    code: DayPlanErrorCode,
    message: string,
    details: Record<string, unknown> | null = null,
  ) {
    super(message);
    this.name = "DayPlanError";
    this.code = code;
    this.details = details;
  }
}

// ── Limits (mirrors of the server ones — the server is the source of truth) ──

export const DAY_PLAN_LIMITS = {
  textMin: 3,
  textMax: 4000,
  titleMax: 120,
  durationMin: 5,
  durationMax: 480,
  durationStep: 5,
  planMinutesMax: 960,
} as const;

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

export const toHHMM = (minutes: number): string => {
  const m = Math.max(0, Math.min(24 * 60, Math.round(minutes)));
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/** "1 ч 30 мин", "45 мин", "2 ч" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} ч ${m} мин`;
  if (h) return `${h} ч`;
  return `${m} мин`;
}

/** by start time; items without a time last, keeping their order */
export function sortByTime<T extends { startTime: string | null }>(items: readonly T[]): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      if (a.item.startTime && b.item.startTime) {
        return toMinutes(a.item.startTime) - toMinutes(b.item.startTime) || a.index - b.index;
      }
      if (a.item.startTime) return -1;
      if (b.item.startTime) return 1;
      return a.index - b.index;
    })
    .map((x) => x.item);
}

/** by date, then by start time (items without a time last within their date) */
export function sortByDateTime<T extends { date: string; startTime: string | null }>(
  items: readonly T[],
): T[] {
  const dates = [...new Set(items.map((i) => i.date))].sort();
  return dates.flatMap((d) => sortByTime(items.filter((i) => i.date === d)));
}

/** duplicates of quests already on the date start switched off */
export function toEditableItems(items: PlanItem[]): EditablePlanItem[] {
  return sortByDateTime(items).map((item, i) => ({
    ...item,
    key: `p${i}`,
    enabled: !item.duplicateOfExisting,
  }));
}

export function totalMinutes(
  items: ReadonlyArray<Pick<EditablePlanItem, "enabled" | "durationMinutes">>,
) {
  return items
    .filter((i) => i.enabled)
    .reduce((s, i) => s + (Number.isFinite(i.durationMinutes) ? i.durationMinutes : 0), 0);
}

/** What is wrong with an item before it can be confirmed (null = ok) */
export function validateItem(item: EditablePlanItem): string | null {
  if (!item.enabled) return null;
  const title = item.title.trim();
  if (!title) return "Назови пункт";
  if (title.length > DAY_PLAN_LIMITS.titleMax)
    return `Название — до ${DAY_PLAN_LIMITS.titleMax} символов`;
  const d = item.durationMinutes;
  if (
    !Number.isInteger(d) ||
    d < DAY_PLAN_LIMITS.durationMin ||
    d > DAY_PLAN_LIMITS.durationMax ||
    d % DAY_PLAN_LIMITS.durationStep !== 0
  ) {
    return `Длительность — от ${DAY_PLAN_LIMITS.durationMin} до ${DAY_PLAN_LIMITS.durationMax} мин, шаг ${DAY_PLAN_LIMITS.durationStep}`;
  }
  if (item.startTime !== null && !HHMM.test(item.startTime)) return "Время — в формате ЧЧ:ММ";
  if (item.skill.kind === "new") {
    if (!item.skill.name.trim()) return "Назови новый навык";
    if (item.skill.attributes.length < 1 || item.skill.attributes.length > 2)
      return "Выбери 1–2 характеристики";
  }
  return null;
}

/** Payload of RPC apply_day_plan (snake_case) for the enabled items */
export function toApplyPayload(items: ReadonlyArray<EditablePlanItem>) {
  return items
    .filter((i) => i.enabled)
    .map((i) => ({
      title: i.title.trim(),
      date: i.date,
      start_time: i.startTime,
      duration_minutes: i.durationMinutes,
      skill:
        i.skill.kind === "existing"
          ? { kind: "existing", skill_id: i.skill.skillId }
          : i.skill.kind === "new"
            ? {
                kind: "new",
                name: i.skill.name.trim(),
                attributes: i.skill.attributes,
                icon: i.skill.icon,
              }
            : { kind: "none" },
    }));
}

// ── Overlaps ──

export interface TimedEntry {
  key: string;
  title: string;
  /** "YYYY-MM-DD"; entries of different dates never overlap (no date = same day as everything) */
  date?: string;
  startTime: string | null;
  durationMinutes: number | null;
}

/**
 * For every timed entry of `items`: titles of the other entries (items + `others`, e.g. quests already on
 * the plan) of the same date whose [start, start + duration) intersects it. Touching intervals do not overlap.
 */
export function findOverlaps(
  items: ReadonlyArray<TimedEntry>,
  others: ReadonlyArray<TimedEntry> = [],
): Map<string, string[]> {
  const span = (e: TimedEntry) =>
    e.startTime && e.durationMinutes && e.durationMinutes > 0
      ? ([toMinutes(e.startTime), toMinutes(e.startTime) + e.durationMinutes] as const)
      : null;
  const all = [...items, ...others];
  const result = new Map<string, string[]>();
  for (const item of items) {
    const a = span(item);
    if (!a) continue;
    const hits = all.filter((o) => {
      if (o.key === item.key) return false;
      if (item.date && o.date && item.date !== o.date) return false;
      const b = span(o);
      return b !== null && a[0] < b[1] && b[0] < a[1];
    });
    if (hits.length)
      result.set(
        item.key,
        hits.map((h) => h.title),
      );
  }
  return result;
}

// ── Client clock ──

/** local time "HH:MM" */
export function nowLocalHHMM(now = new Date()): string {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

// ── Draft (per date, localStorage; storage may be unavailable) ──

export const planDrafts = createDraftStore("dayforge:day-plan-draft:");
