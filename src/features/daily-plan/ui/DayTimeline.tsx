import type { CSSProperties } from "react";

import { NEUTRAL_GLOW_COLOR } from "@/entities/character/model/aspect";
import { getSkillColor, type SkillView } from "@/entities/character/model/skillPresentation";
import { SkillIcon } from "@/entities/character/ui/SkillBadge";
import { toHHMM } from "@/entities/daily-plan/model/aiDayPlan";
import type { Quest } from "@/entities/daily-plan/model/dailyPlanTypes";
import { layoutTimeline } from "@/entities/daily-plan/model/timelineLayout";

import styles from "./DayTimeline.module.scss";

/** pixels per minute of the vertical scale */
const PX_PER_MIN = 1.1;
const MIN_BLOCK_PX = 26;

interface DayTimelineProps {
  quests: Quest[];
  skills: SkillView[];
  onComplete: (quest: Quest) => void;
  completingId: string | null;
}

/**
 * Vertical day scale with the timed quests as blocks (position = start, height = duration), coloured by the
 * main attribute of the skill (neutral without one); overlapping quests side by side; completed ones dimmed.
 */
export function DayTimeline({ quests, skills, onComplete, completingId }: DayTimelineProps) {
  const layout = layoutTimeline(quests);
  const byId = new Map(quests.map((q) => [q.id, q]));
  const skillById = new Map(skills.map((s) => [s.id, s]));
  const height = (layout.rangeEnd - layout.rangeStart) * PX_PER_MIN;
  const y = (minutes: number) => (minutes - layout.rangeStart) * PX_PER_MIN;

  return (
    <div className={styles.timeline} style={{ height }} data-testid="day-timeline">
      {layout.hours.map((m) => (
        <div key={m} className={styles.hour} style={{ top: y(m) }}>
          <span className={styles.hourLabel}>{toHHMM(m)}</span>
        </div>
      ))}

      <div className={styles.lane}>
        {layout.blocks.map((b) => {
          const quest = byId.get(b.id)!;
          const skill = quest.skillId ? skillById.get(quest.skillId) : undefined;
          const color = skill ? getSkillColor(skill.primaryAttribute) : NEUTRAL_GLOW_COLOR;
          const done = quest.status === "completed";
          const blockHeight = Math.max(MIN_BLOCK_PX, (b.end - b.start) * PX_PER_MIN - 2);
          const style = {
            top: y(b.start),
            height: blockHeight,
            left: `calc(${(100 * b.column) / b.columns}% + 2px)`,
            width: `calc(${100 / b.columns}% - 4px)`,
            "--block-color": color,
          } as CSSProperties;
          const compact = blockHeight < 44;
          return (
            <button
              key={b.id}
              type="button"
              className={[
                styles.block,
                done ? styles.blockDone : "",
                skill ? "" : styles.blockNeutral,
                compact ? styles.blockCompact : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={style}
              onClick={() => {
                if (!done && completingId === null) onComplete(quest);
              }}
              disabled={done || completingId === quest.id}
              aria-label={
                done
                  ? `Выполнено: ${quest.title}, ${toHHMM(b.start)}–${toHHMM(b.end)}`
                  : `Отметить выполненным: ${quest.title}, ${toHHMM(b.start)}–${toHHMM(b.end)}`
              }
              data-testid="timeline-block"
              data-columns={b.columns}
              data-status={quest.status}
            >
              {skill && (
                <span className={styles.blockIcon}>
                  <SkillIcon
                    name={skill.name}
                    primaryAttribute={skill.primaryAttribute}
                    iconKey={skill.iconKey}
                    form={skill.form}
                    size={compact ? 18 : 24}
                    iconSize={compact ? 11 : 15}
                  />
                </span>
              )}
              <span className={styles.blockText}>
                <span className={styles.blockTitle}>
                  {done && <span className={styles.check}>✓ </span>}
                  {quest.title}
                </span>
                {!compact && (
                  <span className={styles.blockTime}>
                    {toHHMM(b.start)}–{toHHMM(b.end)}
                    {skill ? ` · ${skill.name}` : ""}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
