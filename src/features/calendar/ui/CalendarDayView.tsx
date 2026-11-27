import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { NEUTRAL_GLOW_COLOR } from "@/entities/character/model/aspect";
import { getSkillColor, type SkillView } from "@/entities/character/model/skillPresentation";
import { SkillIcon } from "@/entities/character/ui/SkillBadge";
import { formatDuration, toHHMM, toMinutes } from "@/entities/daily-plan/model/aiDayPlan";
import { draggedStart, nowLineMinutes, tapTime } from "@/entities/daily-plan/model/calendar";
import type { CalendarQuest } from "@/entities/daily-plan/model/dailyPlanTypes";
import { layoutTimeline, questLength } from "@/entities/daily-plan/model/timelineLayout";

import styles from "./Calendar.module.scss";

/** pixels per minute of the day scale */
export const DAY_PX_PER_MIN = 1.1;
const MIN_BLOCK_PX = 26;
/** touch / pen: hold this long before a block can be dragged (shorter moves scroll the page) */
const LONG_PRESS_MS = 400;
/** movement that cancels a pending long press / starts a mouse drag */
const TOUCH_SLOP_PX = 8;
const MOUSE_SLOP_PX = 3;
const SWIPE_PX = 60;

interface Gesture {
  questId: string;
  pointerId: number;
  pointerType: string;
  element: HTMLElement;
  startX: number;
  startY: number;
  origStart: number;
  duration: number;
  active: boolean;
  timer: number | null;
}

interface CalendarDayViewProps {
  date: string;
  quests: CalendarQuest[];
  skills: SkillView[];
  now: Date;
  onOpen: (quest: CalendarQuest) => void;
  /** a tap on an empty place of the scale: create a quest at that time */
  onCreateAt: (time: string) => void;
  /** a block was dropped at a new start (the parent saves it via update_quest) */
  onMove: (quest: CalendarQuest, startTime: string) => void;
  /** horizontal swipe: +1 next day, −1 previous day */
  onSwipe: (direction: 1 | -1) => void;
}

/**
 * Day view: hour scale min(07:00, earliest) – max(23:00, latest end); blocks by start and duration, coloured by
 * the main attribute of the skill (neutral without one), overlapping blocks side by side, completed ones dimmed
 * with ✓; «Без времени» above; the «now» line on the calendar date of now. Editing: tap a block (card), drag it
 * vertically in 15-minute steps (mouse at once, touch after a 400 ms hold), tap an empty place to create.
 */
export function CalendarDayView({
  date,
  quests,
  skills,
  now,
  onOpen,
  onCreateAt,
  onMove,
  onSwipe,
}: CalendarDayViewProps) {
  const [drag, setDrag] = useState<{ id: string; start: number } | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const suppressClick = useRef(false);
  const laneRef = useRef<HTMLDivElement>(null);
  const laneGesture = useRef<{ x: number; y: number; pointerId: number } | null>(null);

  // while a block is being dragged by touch, the page must not scroll
  useEffect(() => {
    const lane = laneRef.current;
    if (!lane) return;
    const block = (e: TouchEvent) => {
      if (gesture.current?.active) e.preventDefault();
    };
    lane.addEventListener("touchmove", block, { passive: false });
    return () => lane.removeEventListener("touchmove", block);
  }, []);

  useEffect(
    () => () => {
      if (gesture.current?.timer) window.clearTimeout(gesture.current.timer);
    },
    [],
  );

  // the dragged block is shown at its preview start
  const shown = quests.map((q) =>
    drag && q.id === drag.id ? { ...q, startTime: toHHMM(drag.start) } : q,
  );
  const layout = layoutTimeline(shown);
  const byId = new Map(shown.map((q) => [q.id, q]));
  const skillById = new Map(skills.map((s) => [s.id, s]));
  const height = (layout.rangeEnd - layout.rangeStart) * DAY_PX_PER_MIN;
  const y = (minutes: number) => (minutes - layout.rangeStart) * DAY_PX_PER_MIN;
  const nowMinutes = nowLineMinutes(now, date);
  const untimed = shown.filter((q) => !q.startTime);

  function startActiveDrag(g: Gesture) {
    g.active = true;
    try {
      g.element.setPointerCapture(g.pointerId);
    } catch {
      /* the pointer may already be gone */
    }
    setDrag({ id: g.questId, start: g.origStart });
  }

  function onBlockPointerDown(e: ReactPointerEvent<HTMLButtonElement>, quest: CalendarQuest) {
    e.stopPropagation(); // not a lane tap / swipe
    // a new press: forget a suppressed click of the previous drag (after a touch drag no click arrives)
    suppressClick.current = false;
    if (quest.status === "completed" || !quest.startTime) return; // completed quests are not dragged
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const g: Gesture = {
      questId: quest.id,
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      element: e.currentTarget,
      startX: e.clientX,
      startY: e.clientY,
      origStart: toMinutes(quest.startTime),
      duration: questLength(quest),
      active: false,
      timer: null,
    };
    if (e.pointerType === "mouse") {
      // capture at once: a fast first move may already leave the block (mouse pointers are not captured implicitly)
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    } else {
      g.timer = window.setTimeout(() => {
        g.timer = null;
        if (gesture.current === g) startActiveDrag(g);
      }, LONG_PRESS_MS);
    }
    gesture.current = g;
  }

  function onBlockPointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    const g = gesture.current;
    if (!g || e.pointerId !== g.pointerId) return;
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    if (!g.active) {
      if (g.pointerType === "mouse") {
        if (Math.abs(dy) > MOUSE_SLOP_PX) startActiveDrag(g);
        else return;
      } else {
        // a move before the long press: the user scrolls or swipes — let the browser have it
        if (Math.abs(dx) > TOUCH_SLOP_PX || Math.abs(dy) > TOUCH_SLOP_PX) {
          if (g.timer) window.clearTimeout(g.timer);
          gesture.current = null;
        }
        return;
      }
    }
    e.preventDefault();
    setDrag({ id: g.questId, start: draggedStart(g.origStart, dy, DAY_PX_PER_MIN, g.duration) });
  }

  function finishBlockGesture(e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) {
    const g = gesture.current;
    if (!g || e.pointerId !== g.pointerId) return;
    if (g.timer) window.clearTimeout(g.timer);
    gesture.current = null;
    if (!g.active) return; // a plain tap → click opens the card
    suppressClick.current = true;
    const start = draggedStart(g.origStart, e.clientY - g.startY, DAY_PX_PER_MIN, g.duration);
    setDrag(null);
    const quest = quests.find((q) => q.id === g.questId);
    if (!cancelled && quest && start !== g.origStart) onMove(quest, toHHMM(start));
  }

  function onLanePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    laneGesture.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
  }

  function onLanePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const g = laneGesture.current;
    laneGesture.current = null;
    if (!g || g.pointerId !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
      onSwipe(dx < 0 ? 1 : -1);
      return;
    }
    if (Math.abs(dx) < TOUCH_SLOP_PX && Math.abs(dy) < TOUCH_SLOP_PX && laneRef.current) {
      const offset = e.clientY - laneRef.current.getBoundingClientRect().top;
      onCreateAt(tapTime(offset, layout.rangeStart, DAY_PX_PER_MIN));
    }
  }

  return (
    <div className={styles.dayView} data-testid="calendar-day" data-date={date}>
      {untimed.length > 0 && (
        <div className={styles.untimed} data-testid="calendar-untimed">
          <p className={styles.untimedTitle}>Без времени</p>
          <div className={styles.untimedList}>
            {untimed.map((q) => {
              const done = q.status === "completed";
              return (
                <button
                  key={q.id}
                  type="button"
                  className={[styles.untimedChip, done ? styles.blockDone : ""]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onOpen(q)}
                  data-testid="calendar-untimed-quest"
                >
                  {done && <span className={styles.check}>✓ </span>}
                  <span className={styles.blockTitle}>{q.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.timeline} style={{ height }} data-testid="day-timeline">
        {layout.hours.map((m) => (
          <div key={m} className={styles.hour} style={{ top: y(m) }}>
            <span className={styles.hourLabel}>{toHHMM(m)}</span>
          </div>
        ))}

        <div
          ref={laneRef}
          className={styles.lane}
          onPointerDown={onLanePointerDown}
          onPointerUp={onLanePointerUp}
          onPointerCancel={() => (laneGesture.current = null)}
          data-testid="calendar-lane"
        >
          {nowMinutes !== null &&
            nowMinutes >= layout.rangeStart &&
            nowMinutes <= layout.rangeEnd && (
              <div
                className={styles.nowLine}
                style={{ top: y(nowMinutes) }}
                aria-label={`Сейчас ${toHHMM(nowMinutes)}`}
                data-testid="now-line"
              />
            )}

          {layout.blocks.map((b) => {
            const quest = byId.get(b.id)!;
            const skill = quest.skillId ? skillById.get(quest.skillId) : undefined;
            const color = skill ? getSkillColor(skill.primaryAttribute) : NEUTRAL_GLOW_COLOR;
            const done = quest.status === "completed";
            const dragging = drag?.id === quest.id;
            const blockHeight = Math.max(MIN_BLOCK_PX, (b.end - b.start) * DAY_PX_PER_MIN - 2);
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
                  done ? styles.blockDone : styles.blockDraggable,
                  skill ? "" : styles.blockNeutral,
                  compact ? styles.blockCompact : "",
                  dragging ? styles.blockDragging : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={style}
                onPointerDown={(e) => onBlockPointerDown(e, quest)}
                onPointerMove={onBlockPointerMove}
                onPointerUp={(e) => finishBlockGesture(e, false)}
                onPointerCancel={(e) => finishBlockGesture(e, true)}
                onContextMenu={(e) => e.preventDefault()}
                onClick={() => {
                  if (suppressClick.current) {
                    suppressClick.current = false;
                    return;
                  }
                  onOpen(quest);
                }}
                aria-label={`${done ? "Выполнено: " : ""}${quest.title}, ${toHHMM(b.start)}–${toHHMM(b.end)}`}
                data-testid="timeline-block"
                data-quest-id={quest.id}
                data-columns={b.columns}
                data-status={quest.status}
                data-start={toHHMM(b.start)}
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
                      {toHHMM(b.start)}–{toHHMM(b.end)} · {formatDuration(b.end - b.start)}
                      {skill ? ` · ${skill.name}` : ""}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
