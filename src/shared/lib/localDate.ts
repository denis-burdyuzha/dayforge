/**
 * Calendar dates in the device's local time zone. «Today» is the user's local day — never derive it from
 * toISOString() (that is the UTC day: in UTC+2 between 00:00 and 02:00 it is still yesterday).
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** "YYYY-MM-DD" of `date` in local time */
export function getLocalDateString(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "YYYY-MM-DD" → local midnight of that day (new Date("YYYY-MM-DD") would be UTC midnight) */
export function parseLocalDate(dateString: string): Date {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** Bounds of the local day as ISO timestamps, for timestamptz range queries: [start, end] inclusive */
export function getLocalDayRangeIso(dateString: string): { start: string; end: string } {
  const start = parseLocalDate(dateString);
  const next = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
  return { start: start.toISOString(), end: new Date(next.getTime() - 1).toISOString() };
}
