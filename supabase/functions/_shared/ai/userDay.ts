/**
 * The user's day on the server (no imports — also imported by the client test that compares it with
 * src/shared/lib/userDay.ts getUserDayDate). The day starts at `dayStartTime` ("HH:MM", 00:00–06:00), not at
 * midnight: before the boundary the local night still belongs to the previous date.
 */

export const DEFAULT_DAY_START_TIME = "04:00";

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

export const toHHMM = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** "YYYY-MM-DD" + n days (calendar arithmetic, zone-independent) */
export function addDaysIso(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, (d ?? 1) + n));
  return t.toISOString().slice(0, 10);
}

/** The local calendar date ("YYYY-MM-DD") and time ("HH:MM") of `now` in `timezone`, or null for an unknown zone */
export function localDateTime(now: Date, timezone: string): { date: string; time: string } | null {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    return {
      date: `${get("year")}-${get("month")}-${get("day")}`,
      time: `${get("hour")}:${get("minute")}`,
    };
  } catch {
    return null;
  }
}

/** The user's day of a local calendar date + time: the previous date before `dayStartTime` */
export function userDayDate(
  calendarDate: string,
  localTime: string,
  dayStartTime: string = DEFAULT_DAY_START_TIME,
): string {
  return toMinutes(localTime) < toMinutes(dayStartTime)
    ? addDaysIso(calendarDate, -1)
    : calendarDate;
}

/** Is the moment (date, time) earlier than (nowDate, nowTime)? Both are local calendar date + "HH:MM". */
export function isBefore(date: string, time: string, nowDate: string, nowTime: string): boolean {
  return date < nowDate || (date === nowDate && toMinutes(time) < toMinutes(nowTime));
}
