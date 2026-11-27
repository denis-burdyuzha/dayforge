import { xpRequiredForLevel } from "@/entities/character/model/characterTypes";
import { supabase } from "@/shared/api/supabase/client";
import type { QuestCompletionResult } from "@/shared/api/supabase/rpcTypes";

import type { DailyPlan, NewQuestInput, Quest, QuestUpdateInput } from "../model/dailyPlanTypes";

function mapQuestRow(row: {
  id: string;
  daily_plan_id: string;
  title: string;
  description: string | null;
  status: string;
  position: number;
  xp_reward: number;
  attribute_id: string | null;
  skill_name: string | null;
  hours: number | null;
  skill_id?: string | null;
  start_time?: string | null;
  duration_minutes?: number | null;
  source?: string | null;
}): Quest {
  return {
    id: row.id,
    dailyPlanId: row.daily_plan_id,
    title: row.title,
    description: row.description,
    status: row.status as Quest["status"],
    position: row.position,
    xpReward: row.xp_reward,
    attributeId: row.attribute_id,
    skillName: row.skill_name,
    hours: row.hours,
    skillId: row.skill_id ?? null,
    // Postgres time → "HH:MM"
    startTime: row.start_time ? row.start_time.slice(0, 5) : null,
    durationMinutes: row.duration_minutes ?? null,
    source: (row.source as Quest["source"] | null | undefined) ?? "manual",
  };
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

const QUEST_SELECT =
  "id, daily_plan_id, title, description, status, position, xp_reward, attribute_id, skill_name, hours, skill_id, start_time, duration_minutes, source";

export const dailyPlanRepository = {
  /**
   * Returns the character's plan of a date ("YYYY-MM-DD", the user's day) with quests, or null if none.
   */
  async getPlan(characterId: string, date: string): Promise<DailyPlan | null> {
    const { data: plan, error: planError } = await supabase
      .from("daily_plans")
      .select("id, character_id, date, status")
      .eq("character_id", characterId)
      .eq("date", date)
      .maybeSingle();

    if (planError && planError.code !== "PGRST116") {
      throw new Error(planError.message);
    }

    if (!plan) return null;

    const { data: quests, error: questsError } = await supabase
      .from("quests")
      .select(QUEST_SELECT)
      .eq("daily_plan_id", plan.id)
      .order("position", { ascending: true });

    if (questsError) throw new Error(questsError.message);

    return {
      id: plan.id,
      characterId: plan.character_id,
      date: plan.date,
      status: plan.status as DailyPlan["status"],
      quests: (quests ?? []).map(mapQuestRow),
    };
  },

  /**
   * The plan of a date of the signed-in user's character, created on the server when missing (empty quests).
   * The client never writes game tables directly (RPC get_or_create_daily_plan).
   */
  async getOrCreatePlan(date: string): Promise<DailyPlan> {
    const { data, error } = await supabase.rpc("get_or_create_daily_plan", {
      p_date: date,
    });

    if (error) throw new Error(error.message);

    const plan = data as { id: string; character_id: string; date: string; status: string };
    return {
      id: plan.id,
      characterId: plan.character_id,
      date: plan.date,
      status: plan.status as DailyPlan["status"],
      quests: [],
    };
  },

  /**
   * Adds a manual quest on the plan date (RPC create_quest). A skill typed by name: an existing one is linked by
   * id; a new one is created first (RPC create_skill — 1–2 attribute codes, the server dedups by name/alias).
   * hours → duration in minutes (the server derives hours from it for the skill credit).
   */
  async addQuest(planDate: string, input: NewQuestInput): Promise<Quest> {
    const rawSkillName = input.skillName?.trim();
    let skillId: string | null = null;

    if (rawSkillName) {
      // existing character skill (case-insensitive, RLS: own skills only)
      const { data: existingSkill, error: findErr } = await supabase
        .from("character_skills")
        .select("id")
        .ilike("name", rawSkillName)
        .maybeSingle();
      if (findErr && findErr.code !== "PGRST116") throw new Error(findErr.message);

      if (existingSkill) {
        skillId = existingSkill.id;
      } else {
        const { data: created, error: createErr } = await supabase.rpc("create_skill", {
          p_name: rawSkillName,
          p_attributes: input.attributeCodes ?? [],
        });
        if (createErr) throw new Error(createErr.message);
        skillId = (created as { id: string }).id;
      }
    }

    const durationMinutes = rawSkillName && input.hours ? Math.round(input.hours * 60) : null;

    const { data, error } = await supabase.rpc("create_quest", {
      p_date: planDate,
      p_title: input.title,
      ...(durationMinutes !== null ? { p_duration_minutes: durationMinutes } : {}),
      ...(skillId !== null ? { p_skill_id: skillId } : {}),
    });

    if (error) throw new Error(error.message);

    return mapQuestRow(data as Parameters<typeof mapQuestRow>[0]);
  },

  /**
   * Updates the editable fields of a quest (RPC update_quest; the full state is sent — null clears a field).
   * A completed quest accepts only a new title (QUEST_COMPLETED otherwise). No UI uses it yet.
   */
  async updateQuest(questId: string, input: QuestUpdateInput): Promise<Quest> {
    const { data, error } = await supabase.rpc("update_quest", {
      p_quest_id: questId,
      p_title: input.title,
      p_date: input.date,
      ...(input.startTime !== null ? { p_start_time: input.startTime } : {}),
      ...(input.durationMinutes !== null ? { p_duration_minutes: input.durationMinutes } : {}),
      ...(input.skillId !== null ? { p_skill_id: input.skillId } : {}),
    });

    if (error) throw new Error(error.message);

    return mapQuestRow(data as Parameters<typeof mapQuestRow>[0]);
  },

  /** Deletes a pending quest (RPC delete_quest; a completed quest cannot be deleted). No UI uses it yet. */
  async deleteQuest(questId: string): Promise<void> {
    const { error } = await supabase.rpc("delete_quest", { p_quest_id: questId });
    if (error) throw new Error(error.message);
  },

  /**
   * Marks a quest as completed via the complete_quest RPC.
   * The RPC atomically handles:
   *  - Quest status update
   *  - Character XP + level recalculation
   *  - Attribute gain (+1 fixed)
   *  - Skill upsert + XP with form multiplier (if skill_name/hours set)
   */
  async completeQuest(questId: string, _characterId?: string): Promise<QuestCompletionResult> {
    const { data, error } = await supabase.rpc("complete_quest", {
      p_quest_id: questId,
    });

    if (error) throw new Error(error.message);

    const res = data as {
      success: boolean;
      xpAwarded: number;
      oldLevel: number;
      newLevel: number;
      nextLevelThreshold: number;
      attributeGained: number;
      skillXpGained: number;
      skillLevel: number;
      message?: string;
    };

    if (!res.success && res.message === "Quest already completed") {
      return {
        xpAwarded: 0,
        oldLevel: res.oldLevel,
        newLevel: res.newLevel,
        attributeGained: 0,
        skillXpGained: 0,
        skillLevel: 0,
      };
    }

    return {
      xpAwarded: res.xpAwarded,
      newLevel: res.newLevel,
      oldLevel: res.oldLevel,
      attributeGained: res.attributeGained ?? 0,
      skillXpGained: res.skillXpGained ?? 0,
      skillLevel: res.skillLevel ?? 0,
    };
  },

  /**
   * Returns required XP for the next level (exposed so UI doesn't import characterTypes directly).
   */
  xpRequiredForLevel,
};
