export type QuestStatus = "pending" | "completed";

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
