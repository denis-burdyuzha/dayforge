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
  /** Primary attribute ID for new skill creation */
  primaryAttributeId?: string | null;
  /** Secondary attribute ID for new skill creation */
  secondaryAttributeId?: string | null;
}
