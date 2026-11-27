import { parseLocalDate } from "./localDate";
import { addDays } from "./userDay";

/** "27 нояб." */
export function shortDate(date: string): string {
  return parseLocalDate(date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

/**
 * A day relative to the user's today: «Сегодня, 27 нояб.», «Завтра, 28 нояб.», «Вчера, 26 нояб.»,
 * otherwise «пн, 30 нояб.».
 */
export function dayLabel(date: string, today: string): string {
  const relative =
    date === today
      ? "Сегодня"
      : date === addDays(today, 1)
        ? "Завтра"
        : date === addDays(today, -1)
          ? "Вчера"
          : parseLocalDate(date).toLocaleDateString("ru-RU", { weekday: "short" });
  return `${relative}, ${shortDate(date)}`;
}
