/**
 * The user's day: it starts at `dayStartTime` (local "HH:MM", 00:00–06:00), not at midnight. Before the boundary the
 * local night still belongs to the previous day — «today» for the plan, report, calendar and XP of the day.
 * A copy of the date rule lives in supabase/functions/_shared/ai/userDay.ts (a test compares both).
 */
import { getLocalDateString, parseLocalDate } from "./localDate";

export const DEFAULT_DAY_START_TIME = "04:00";

/** "HH:MM" or "HH:MM:SS" → minutes since midnight (invalid → 0) */
export function timeToMinutes(time: string): number {
  const m = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** "YYYY-MM-DD" + n days (local calendar arithmetic) */
export function addDays(date: string, n: number): string {
  const d = parseLocalDate(date);
  return getLocalDateString(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
}

/** The user's day date of the moment `now`: the local date, or the previous one before `dayStartTime` */
export function getUserDayDate(
  now: Date = new Date(),
  dayStartTime: string = DEFAULT_DAY_START_TIME,
): string {
  const local = getLocalDateString(now);
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes < timeToMinutes(dayStartTime) ? addDays(local, -1) : local;
}

/** Local Date of `date` at `time` ("HH:MM") */
export function localDateTime(date: string, time: string): Date {
  const d = parseLocalDate(date);
  const minutes = timeToMinutes(time);
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    Math.floor(minutes / 60),
    minutes % 60,
  );
}

/** Bounds of the user's day as ISO timestamps for timestamptz ranges: [date + boundary, next date + boundary − 1 ms] */
export function getUserDayRangeIso(
  date: string,
  dayStartTime: string = DEFAULT_DAY_START_TIME,
): { start: string; end: string } {
  const start = localDateTime(date, dayStartTime);
  const next = localDateTime(addDays(date, 1), dayStartTime);
  return { start: start.toISOString(), end: new Date(next.getTime() - 1).toISOString() };
}

/** Does the moment `at` belong to the user's day `date`? */
export function isInUserDay(
  at: Date,
  date: string,
  dayStartTime: string = DEFAULT_DAY_START_TIME,
): boolean {
  return getUserDayDate(at, dayStartTime) === date;
}

export type PlanTarget = "today" | "tomorrow";

/**
 * Default target of the plan input: «Завтра» from 18:00, and also at night before the day boundary (the user plans
 * the coming morning); «Сегодня» otherwise.
 */
export function defaultPlanTarget(
  now: Date = new Date(),
  dayStartTime: string = DEFAULT_DAY_START_TIME,
): PlanTarget {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= 18 * 60 || minutes < timeToMinutes(dayStartTime) ? "tomorrow" : "today";
}
