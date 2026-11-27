import type { CSSProperties } from "react";

import { NEUTRAL_GLOW_COLOR } from "@/entities/character/model/aspect";
import { getSkillColor, type SkillView } from "@/entities/character/model/skillPresentation";
import { SkillIcon } from "@/entities/character/ui/SkillBadge";
import { toHHMM } from "@/entities/daily-plan/model/aiDayPlan";
import { nowLineMinutes } from "@/entities/daily-plan/model/calendar";
import type { CalendarQuest } from "@/entities/daily-plan/model/dailyPlanTypes";
import { layoutTimeline } from "@/entities/daily-plan/model/timelineLayout";
import { parseLocalDate } from "@/shared/lib/localDate";

import styles from "./Calendar.module.scss";

const WEEK_PX_PER_MIN = 0.7;
const MIN_BLOCK_PX = 14;
/** a block this tall shows its title next to the icon */
const TITLE_MIN_PX = 26;

interface CalendarWeekViewProps {
  /** Monday … Sunday */
  days: string[];
  quests: CalendarQuest[];
  skills: SkillView[];
  today: string;
  now: Date;
  /** a tap on a day opens the «День» view of it */
  onOpenDay: (date: string) => void;
}

/** Week view: 7 columns Monday–Sunday on one hour scale, compact blocks (skill icon + title when it fits). */
export function CalendarWeekView({
  days,
  quests,
  skills,
  today,
  now,
  onOpenDay,
}: CalendarWeekViewProps) {
  const skillById = new Map(skills.map((s) => [s.id, s]));
  const perDay = days.map((date) => {
    const dayQuests = quests.filter((q) => q.date === date);
    return { date, quests: dayQuests, layout: layoutTimeline(dayQuests) };
  });
  const rangeStart = Math.min(...perDay.map((d) => d.layout.rangeStart));
  const rangeEnd = Math.max(...perDay.map((d) => d.layout.rangeEnd));
  const hours: number[] = [];
  for (let m = rangeStart; m <= rangeEnd; m += 60) hours.push(m);
  const height = (rangeEnd - rangeStart) * WEEK_PX_PER_MIN;
  const y = (minutes: number) => (minutes - rangeStart) * WEEK_PX_PER_MIN;

  return (
    <div className={styles.weekView} data-testid="calendar-week">
      <div className={styles.weekHeader}>
        <span />
        {days.map((date) => {
          const d = parseLocalDate(date);
          const untimed = perDay.find((p) => p.date === date)!.layout.untimed.length;
          return (
            <button
              key={date}
              type="button"
              className={[styles.weekDayBtn, date === today ? styles.weekDayToday : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onOpenDay(date)}
              aria-label={d.toLocaleDateString("ru-RU", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              data-testid={`week-day-${date}`}
            >
              <span className={styles.weekDayName}>
                {d.toLocaleDateString("ru-RU", { weekday: "short" })}
              </span>
              <span className={styles.weekDayNum}>{d.getDate()}</span>
              {untimed > 0 && <span className={styles.weekUntimed}>+{untimed}</span>}
            </button>
          );
        })}
      </div>

      <div className={styles.weekBody} style={{ height }}>
        {hours.map((m) => (
          <div key={m} className={styles.hour} style={{ top: y(m) }}>
            <span className={styles.hourLabel}>{toHHMM(m)}</span>
          </div>
        ))}
        <div className={styles.weekColumns}>
          {perDay.map(({ date, quests: dayQuests, layout }) => {
            const byId = new Map(dayQuests.map((q) => [q.id, q]));
            const nowMinutes = nowLineMinutes(now, date);
            return (
              <button
                key={date}
                type="button"
                className={[styles.weekColumn, date === today ? styles.weekColumnToday : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onOpenDay(date)}
                aria-label={`Открыть день ${date}`}
                data-testid={`week-column-${date}`}
              >
                {nowMinutes !== null && nowMinutes >= rangeStart && nowMinutes <= rangeEnd && (
                  <span className={styles.nowLine} style={{ top: y(nowMinutes) }} />
                )}
                {layout.blocks.map((b) => {
                  const quest = byId.get(b.id)!;
                  const skill = quest.skillId ? skillById.get(quest.skillId) : undefined;
                  const color = skill ? getSkillColor(skill.primaryAttribute) : NEUTRAL_GLOW_COLOR;
                  const blockHeight = Math.max(
                    MIN_BLOCK_PX,
                    (b.end - b.start) * WEEK_PX_PER_MIN - 1,
                  );
                  const style = {
                    top: y(b.start),
                    height: blockHeight,
                    left: `${(100 * b.column) / b.columns}%`,
                    width: `${100 / b.columns}%`,
                    "--block-color": color,
                  } as CSSProperties;
                  return (
                    <span
                      key={b.id}
                      className={[
                        styles.weekBlock,
                        quest.status === "completed" ? styles.blockDone : "",
                        skill ? "" : styles.blockNeutral,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={style}
                      title={`${quest.title}, ${toHHMM(b.start)}–${toHHMM(b.end)}`}
                      data-testid="week-block"
                    >
                      {skill && (
                        <SkillIcon
                          name={skill.name}
                          primaryAttribute={skill.primaryAttribute}
                          iconKey={skill.iconKey}
                          form={skill.form}
                          size={14}
                          iconSize={9}
                        />
                      )}
                      {blockHeight >= TITLE_MIN_PX && (
                        <span className={styles.weekBlockTitle}>{quest.title}</span>
                      )}
                    </span>
                  );
                })}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
