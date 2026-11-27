export type QuestStatus = "pending" | "completed";

/** where the quest came from: the manual form, the AI plan, or an event of the AI evening report */
export type QuestSource = "manual" | "ai_plan" | "ai_report";

export interface Quest {
  id: string;
  dailyPlanId: string;
  title: string;
  description: string | null;
  status: QuestStatus;
  position: number;
  xpReward: number;
  /** Optional link to an attribute definition */
  attributeId: string | null;
  /** Optional skill name to practice (linked to character_skills) */
  skillName: string | null;
  /** Hours of practice credited to the skill on completion */
  hours: number | null;
  /** Linked skill ID */
  skillId: string | null;
  /** local start time "HH:MM" (null = no time) */
  startTime: string | null;
  /** planned duration, minutes (null for quests created without one) */
  durationMinutes: number | null;
  source: QuestSource;
}

/** A quest with the date of its plan (calendar views) */
export interface CalendarQuest extends Quest {
  /** "YYYY-MM-DD" */
  date: string;
}

export interface DailyPlan {
  id: string;
  characterId: string;
  date: string;
  status: "planned" | "completed";
  quests: Quest[];
}

export interface NewQuestInput {
  title: string;
  description?: string;
  /** Skill name to link */
  skillName?: string | null;
  /** Hours of practice for the skill */
  hours?: number | null;
  /** Attribute codes of a NEW skill: primary first, 1–2 (required when the skill does not exist yet) */
  attributeCodes?: string[];
}

/** Editable fields of a quest (update_quest — the full state; null = no time / duration / skill) */
export interface QuestUpdateInput {
  title: string;
  /** "YYYY-MM-DD" — another date moves the quest to that day's plan */
  date: string;
  startTime: string | null;
  durationMinutes: number | null;
  skillId: string | null;
}
