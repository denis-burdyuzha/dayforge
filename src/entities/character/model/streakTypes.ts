/** A day of the streak week row (Mon–Sun of the current user week) */
export type StreakDayStatus = "done" | "frozen" | "missed" | "today" | "future";

export interface StreakDay {
  date: string;
  status: StreakDayStatus;
}

/** The daily streak (server: _streak_info — «день сдан» = a daily report for the user's date) */
export interface Streak {
  current: number;
  longest: number;
  frozenDates: string[];
  todayDone: boolean;
  /** The streak broke in the last 3 days after a run of ≥ 3 — show «С возвращением!» once */
  brokenRecently: boolean;
  /** The day the last break happened (the key for «don't show again») */
  brokenOn: string | null;
  today: string;
  week: StreakDay[];
}

const STATUSES: readonly StreakDayStatus[] = ["done", "frozen", "missed", "today", "future"];

function isStatus(v: unknown): v is StreakDayStatus {
  return typeof v === "string" && (STATUSES as readonly string[]).includes(v);
}

/** Maps the jsonb of _streak_info (snake_case) to Streak; missing fields fall back to an empty streak */
export function mapStreak(raw: unknown): Streak {
  const r = (raw ?? {}) as Record<string, unknown>;
  const week = Array.isArray(r.week) ? (r.week as Record<string, unknown>[]) : [];
  return {
    current: Number(r.current ?? 0),
    longest: Number(r.longest ?? 0),
    frozenDates: Array.isArray(r.frozen_dates) ? (r.frozen_dates as string[]) : [],
    todayDone: r.today_done === true,
    brokenRecently: r.broken_recently === true,
    brokenOn: typeof r.broken_on === "string" ? r.broken_on : null,
    today: typeof r.today === "string" ? r.today : "",
    week: week.map((d) => ({
      date: String(d.date ?? ""),
      status: isStatus(d.status) ? d.status : "missed",
    })),
  };
}
