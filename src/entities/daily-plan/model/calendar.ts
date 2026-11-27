/**
 * Calendar model (pure): weeks Monday–Sunday, the vertical scale (minutes ↔ pixels, 15-minute snapping), the «now»
 * line, error texts of the quest RPCs. The hour range and the overlap columns come from layoutTimeline.
 */
import { getLocalDateString, parseLocalDate } from "@/shared/lib/localDate";
import { addDays } from "@/shared/lib/userDay";

import { toHHMM } from "./aiDayPlan";

export const SNAP_MINUTES = 15;
export const DAY_MINUTES = 24 * 60;
export const DEFAULT_NEW_DURATION = 60;
export const DURATION_LIMITS = { min: 5, max: 480, step: 5 } as const;

/** Monday of the week of `date` */
export function weekStart(date: string): string {
  const day = parseLocalDate(date).getDay(); // 0 = Sunday
  return addDays(date, -((day + 6) % 7));
}

/** The 7 dates (Monday–Sunday) of the week of `date` */
export function weekDays(date: string): string[] {
  const monday = weekStart(date);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** round to the nearest `step` minutes */
export const snapMinutes = (minutes: number, step = SNAP_MINUTES) =>
  Math.round(minutes / step) * step;

/** keep a block of `duration` minutes inside the day */
export const clampStart = (start: number, duration: number) =>
  Math.max(0, Math.min(DAY_MINUTES - Math.min(duration, DAY_MINUTES), start));

/**
 * The new start of a dragged block: original start + vertical movement in minutes, snapped to 15 minutes and kept
 * inside the day.
 */
export function draggedStart(
  originalStart: number,
  deltaPx: number,
  pxPerMin: number,
  duration: number,
): number {
  return clampStart(snapMinutes(originalStart + deltaPx / pxPerMin), duration);
}

/** The time a tap at `offsetPx` from the top of the scale points to, snapped to 15 minutes */
export function tapTime(offsetPx: number, rangeStart: number, pxPerMin: number): string {
  const minutes = clampStart(
    Math.floor((rangeStart + offsetPx / pxPerMin) / SNAP_MINUTES) * SNAP_MINUTES,
    DEFAULT_NEW_DURATION,
  );
  return toHHMM(minutes);
}

/** Minutes of the «now» line on the day `date` (only on the calendar date of now), or null */
export function nowLineMinutes(now: Date, date: string): number | null {
  if (getLocalDateString(now) !== date) return null;
  return now.getHours() * 60 + now.getMinutes();
}

/** «24–30 нояб.» / «30 нояб. – 6 дек.» */
export function weekTitle(date: string): string {
  const days = weekDays(date);
  const first = parseLocalDate(days[0]!);
  const last = parseLocalDate(days[6]!);
  const month = (d: Date) => d.toLocaleDateString("ru-RU", { month: "short" });
  return first.getMonth() === last.getMonth()
    ? `${first.getDate()}–${last.getDate()} ${month(last)}`
    : `${first.getDate()} ${month(first)} – ${last.getDate()} ${month(last)}`;
}

/** TanStack Query key of the calendar week (invalidate ["calendar", characterId] after any quest change) */
export const calendarQueryKey = (characterId: string | undefined, monday: string) =>
  ["calendar", characterId, monday] as const;

/** A readable message for an error of create_quest / update_quest / delete_quest / complete_quest */
export function questErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (/QUEST_COMPLETED/.test(raw))
    return "Квест уже выполнен — у него можно менять только название, удалить его нельзя.";
  if (/INVALID_DURATION/.test(raw)) return "Длительность — от 5 до 480 минут.";
  if (/INVALID_TITLE/.test(raw)) return "Название — от 1 до 120 символов.";
  if (/SKILL_NOT_FOUND/.test(raw)) return "Навык не найден — выбери другой.";
  if (/QUEST_NOT_FOUND/.test(raw)) return "Квест не найден — возможно, его уже удалили.";
  if (/INVALID_DATE/.test(raw)) return "Укажи дату.";
  if (/Failed to fetch|NetworkError|network/i.test(raw))
    return "Нет связи с сервером — изменения не сохранены.";
  return "Не удалось сохранить изменения. Попробуй ещё раз.";
}
