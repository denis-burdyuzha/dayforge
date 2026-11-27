/**
 * «Во сколько ты обычно ложишься спать?» ↔ profiles.day_start_time. No separate column: the day boundary is the
 * bedtime + 2 hours (at most 06:00); «До полуночи» is the default boundary 04:00. The answer is remembered on the
 * device only to tell apart choices that give the same boundary (02:00 and «До полуночи» both mean 04:00).
 */
import { timeToMinutes } from "@/shared/lib/userDay";

export type BedtimeChoice = "before-midnight" | `${number}${number}:${"00" | "30"}`;

/** 00:00 … 04:00 every 30 minutes */
const BEDTIMES: readonly string[] = Array.from({ length: 9 }, (_, i) => hhmm(i * 30));

export const BEDTIME_OPTIONS: ReadonlyArray<{ value: BedtimeChoice; label: string }> = [
  { value: "before-midnight", label: "До полуночи" },
  ...BEDTIMES.map((t) => ({ value: t as BedtimeChoice, label: t })),
];

export const DEFAULT_DAY_START = "04:00";
const MAX_DAY_START = 6 * 60;
const SHIFT = 2 * 60;

function hhmm(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export const isBedtimeChoice = (v: unknown): v is BedtimeChoice =>
  typeof v === "string" && BEDTIME_OPTIONS.some((o) => o.value === v);

/** The value saved to profiles.day_start_time ("HH:MM") for a choice */
export function bedtimeToDayStart(choice: BedtimeChoice): string {
  if (choice === "before-midnight") return DEFAULT_DAY_START;
  return hhmm(Math.min(MAX_DAY_START, timeToMinutes(choice) + SHIFT));
}

/**
 * The choice to show for a stored day_start_time ("HH:MM" or "HH:MM:SS"). The remembered choice wins when it still
 * gives this boundary; otherwise 04:00 → «До полуночи», else boundary − 2 h; a boundary outside the list (an old
 * setting below 02:00) shows the nearest choice (00:00).
 */
export function dayStartToBedtime(
  dayStart: string,
  remembered: BedtimeChoice | null = null,
): BedtimeChoice {
  const start = hhmm(timeToMinutes(dayStart));
  if (remembered && bedtimeToDayStart(remembered) === start) return remembered;
  if (start === DEFAULT_DAY_START) return "before-midnight";
  const nearest = Math.round((timeToMinutes(start) - SHIFT) / 30) * 30; // the list is on a 30-minute grid
  const minutes = Math.max(0, Math.min(timeToMinutes(BEDTIMES.at(-1)!), nearest));
  return hhmm(minutes) as BedtimeChoice;
}

/** The hint under the field, computed from the choice */
export function dayStartExplanation(choice: BedtimeChoice): string {
  const border = bedtimeToDayStart(choice);
  if (choice === "before-midnight") {
    return `День для Dayforge заканчивается в ${border} — так поздние дела не потеряются.`;
  }
  // an example moment half an hour… 2.5 hours before the boundary; never before midnight (that is the same day)
  const exampleMinutes = timeToMinutes(border) - 150;
  const example = hhmm(exampleMinutes >= 0 ? exampleMinutes : timeToMinutes(border) - 30);
  return `Всё, что ты делаешь до ${border}, засчитается в прошедший день. Например, отчёт в ${example} попадёт во вчерашний день.`;
}
