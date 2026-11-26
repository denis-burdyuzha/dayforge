/**
 * Day timeline layout (pure): the hour range shown (earliest quest … latest quest end, at least
 * 07:00–23:00), one block per timed quest positioned by start and duration, overlapping quests side by side
 * in columns (two for a pair), untimed quests listed separately.
 */
import { toMinutes } from "./aiDayPlan";

export interface TimelineQuest {
  id: string;
  startTime: string | null;
  durationMinutes: number | null;
  /** fallback length for quests without duration_minutes */
  hours: number | null;
}

export interface TimelineBlock {
  id: string;
  /** minutes from midnight */
  start: number;
  end: number;
  column: number;
  columns: number;
}

export interface TimelineLayout {
  /** shown range, minutes from midnight, whole hours */
  rangeStart: number;
  rangeEnd: number;
  /** hour marks inside the range */
  hours: number[];
  blocks: TimelineBlock[];
  untimed: string[];
}

export const DEFAULT_RANGE = { start: 7 * 60, end: 23 * 60 } as const;
const DAY_END = 24 * 60;
const FALLBACK_MINUTES = 30;

export function questLength(q: Pick<TimelineQuest, "durationMinutes" | "hours">): number {
  if (q.durationMinutes && q.durationMinutes > 0) return q.durationMinutes;
  if (q.hours && q.hours > 0) return Math.round(q.hours * 60);
  return FALLBACK_MINUTES;
}

export function layoutTimeline(quests: readonly TimelineQuest[]): TimelineLayout {
  const timed = quests
    .filter((q): q is TimelineQuest & { startTime: string } => !!q.startTime)
    .map((q) => {
      const start = toMinutes(q.startTime);
      return { id: q.id, start, end: Math.min(DAY_END, start + questLength(q)) };
    })
    .sort((a, b) => a.start - b.start || b.end - a.end);

  const earliest = timed.length ? Math.min(...timed.map((b) => b.start)) : DEFAULT_RANGE.start;
  const latest = timed.length ? Math.max(...timed.map((b) => b.end)) : DEFAULT_RANGE.end;
  const rangeStart = Math.min(DEFAULT_RANGE.start, Math.floor(earliest / 60) * 60);
  const rangeEnd = Math.min(DAY_END, Math.max(DEFAULT_RANGE.end, Math.ceil(latest / 60) * 60));

  // clusters of transitively overlapping blocks; inside a cluster — first free column
  const blocks: TimelineBlock[] = [];
  let cluster: TimelineBlock[] = [];
  let clusterEnd = -1;
  let columnEnds: number[] = [];
  const flush = () => {
    const columns = Math.max(1, columnEnds.length);
    for (const b of cluster) b.columns = columns;
    blocks.push(...cluster);
    cluster = [];
    columnEnds = [];
  };
  for (const t of timed) {
    if (cluster.length && t.start >= clusterEnd) flush();
    let column = columnEnds.findIndex((end) => end <= t.start);
    if (column < 0) {
      column = columnEnds.length;
      columnEnds.push(t.end);
    } else {
      columnEnds[column] = t.end;
    }
    cluster.push({ ...t, column, columns: 1 });
    clusterEnd = Math.max(clusterEnd, t.end);
  }
  flush();

  const hours: number[] = [];
  for (let m = rangeStart; m <= rangeEnd; m += 60) hours.push(m);

  return {
    rangeStart,
    rangeEnd,
    hours,
    blocks,
    untimed: quests.filter((q) => !q.startTime).map((q) => q.id),
  };
}
