import { mapStreak, type StreakDay } from "@/entities/character/model/streakTypes";
import type { CharacterClassId } from "@/entities/character/model/types";

/** A friend's day: counts, hours and up to 3 skills of the completed quests (no titles, no texts) */
export interface DaySummary {
  date: string;
  plannedCount: number;
  completedCount: number;
  completedHours: number;
  skills: string[];
}

export interface FriendTitleSkill {
  name: string;
  level: number;
  icon: string | null;
  primaryAttribute: string | null;
}

/** A friend card (server: _friend_card) */
export interface FriendCard {
  userId: string;
  name: string;
  classId: CharacterClassId | null;
  level: number;
  tier: number;
  aspect: string | null;
  attributes: Record<string, number>;
  titleSkill: FriendTitleSkill | null;
  streak: number;
  todayDone: boolean;
  /** null — the friend hides the day summary */
  summary: DaySummary | null;
}

/** A friend's profile: the card + longest streak, the week row, the last 7 days (null when hidden) */
export interface FriendProfile extends FriendCard {
  longest: number;
  week: StreakDay[];
  days: DaySummary[] | null;
}

export interface MyFriendCode {
  code: string;
  shareDailySummary: boolean;
}

export interface AddFriendResult {
  friendUserId: string;
  name: string;
  alreadyFriends: boolean;
}

export interface InvitePreview {
  name: string;
  classId: CharacterClassId | null;
}

type Raw = Record<string, unknown>;

const CLASS_IDS: readonly CharacterClassId[] = [
  "warrior",
  "creator",
  "explorer",
  "strategist",
  "wanderer",
];

function toClassId(v: unknown): CharacterClassId | null {
  return typeof v === "string" && (CLASS_IDS as readonly string[]).includes(v)
    ? (v as CharacterClassId)
    : null;
}

export function mapDaySummary(raw: unknown): DaySummary | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Raw;
  return {
    date: String(r.date ?? ""),
    plannedCount: Number(r.planned_count ?? 0),
    completedCount: Number(r.completed_count ?? 0),
    completedHours: Number(r.completed_hours ?? 0),
    skills: Array.isArray(r.skills) ? r.skills.map(String) : [],
  };
}

export function mapFriendCard(raw: unknown): FriendCard {
  const r = (raw ?? {}) as Raw;
  const title = r.title_skill as Raw | null | undefined;
  const attributes: Record<string, number> = {};
  if (r.attributes && typeof r.attributes === "object") {
    for (const [k, v] of Object.entries(r.attributes as Raw)) attributes[k] = Number(v ?? 0);
  }
  return {
    userId: String(r.user_id ?? ""),
    name: String(r.name ?? ""),
    classId: toClassId(r.class),
    level: Number(r.level ?? 1),
    tier: Number(r.tier ?? 1),
    aspect: typeof r.aspect === "string" ? r.aspect : null,
    attributes,
    titleSkill: title
      ? {
          name: String(title.name ?? ""),
          level: Number(title.level ?? 1),
          icon: typeof title.icon === "string" ? title.icon : null,
          primaryAttribute:
            typeof title.primary_attribute === "string" ? title.primary_attribute : null,
        }
      : null,
    streak: Number(r.streak ?? 0),
    todayDone: r.today_done === true,
    summary: mapDaySummary(r.summary),
  };
}

export function mapFriendProfile(raw: unknown): FriendProfile {
  const r = (raw ?? {}) as Raw;
  return {
    ...mapFriendCard(raw),
    longest: Number(r.longest ?? 0),
    week: mapStreak({ week: r.week }).week,
    days: Array.isArray(r.days)
      ? r.days.map(mapDaySummary).filter((d): d is DaySummary => d !== null)
      : null,
  };
}

export function mapInvitePreview(raw: unknown): InvitePreview | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Raw;
  if (typeof r.name !== "string") return null;
  return { name: r.name, classId: toClassId(r.class) };
}
