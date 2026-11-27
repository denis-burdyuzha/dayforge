import { Check, Flame, Snowflake } from "lucide-react";

import type { StreakDay, StreakDayStatus } from "../../model/streakTypes";
import styles from "./Streak.module.scss";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const STATUS_LABEL: Record<StreakDayStatus, string> = {
  done: "сдан",
  frozen: "заморожен",
  missed: "пропущен",
  today: "сегодня",
  future: "впереди",
};

/** Flame + the number of days in a row */
export function StreakBadge({
  value,
  active = true,
  className,
}: {
  value: number;
  /** false — today is not done yet: the flame is dimmed */
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={[styles.badge, active ? styles.badgeActive : "", className ?? ""].join(" ")}
      aria-label={`Серия: ${value} ${daysWord(value)} подряд`}
      data-testid="streak-badge"
    >
      <Flame size={16} aria-hidden="true" />
      <span className={styles.badgeValue}>{value}</span>
    </span>
  );
}

/** «Неделя»: 7 circles Mon–Sun — done / frozen (Snowflake) / missed / today */
export function StreakWeek({ days, className }: { days: StreakDay[]; className?: string }) {
  if (days.length !== 7) return null;
  return (
    <ol
      className={[styles.week, className ?? ""].join(" ")}
      aria-label="Неделя"
      data-testid="streak-week"
    >
      {days.map((d, i) => (
        <li key={d.date} className={styles.day} data-status={d.status}>
          <span className={styles.dot} aria-hidden="true">
            {d.status === "done" && <Check size={14} strokeWidth={3} />}
            {d.status === "frozen" && <Snowflake size={14} />}
          </span>
          <span className={styles.dayLabel}>{WEEKDAYS[i]}</span>
          <span className={styles.srOnly}>{STATUS_LABEL[d.status]}</span>
        </li>
      ))}
    </ol>
  );
}

function daysWord(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "день";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "дня";
  return "дней";
}
