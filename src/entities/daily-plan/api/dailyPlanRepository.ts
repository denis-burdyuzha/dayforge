import { xpRequiredForLevel } from "@/entities/character/model/characterTypes";
import { supabase } from "@/shared/api/supabase/client";
import type { QuestCompletionResult } from "@/shared/api/supabase/rpcTypes";

import type { DailyPlan, NewQuestInput, Quest } from "../model/dailyPlanTypes";

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
  };
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

const QUEST_SELECT =
  "id, daily_plan_id, title, description, status, position, xp_reward, attribute_id, skill_name, hours, skill_id";

export const dailyPlanRepository = {
  /**
   * Returns today's plan for the character (with quests), or null if none.
   */
  async getTodayPlan(characterId: string): Promise<DailyPlan | null> {
    const today = new Date().toISOString().slice(0, 10);

    const { data: plan, error: planError } = await supabase
      .from("daily_plans")
      .select("id, character_id, date, status")
      .eq("character_id", characterId)
      .eq("date", today)
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
   * Creates today's plan for the character and returns it (empty quests).
   */
  async createTodayPlan(characterId: string): Promise<DailyPlan> {
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("daily_plans")
      .insert({ character_id: characterId, date: today, status: "planned" })
      .select("id, character_id, date, status")
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      characterId: data.character_id,
      date: data.date,
      status: data.status as DailyPlan["status"],
      quests: [],
    };
  },

  /**
   * Adds a quest to the plan. Stores skill_name, hours, and skill_id.
   * If the skill is new, inserts it into character_skills with primary/secondary attribute IDs.
   */
  async addQuest(planId: string, input: NewQuestInput): Promise<Quest> {
    // Get current max position
    const { data: existing } = await supabase
      .from("quests")
      .select("position")
      .eq("daily_plan_id", planId)
      .order("position", { ascending: false })
      .limit(1);

    const nextPosition = existing && existing.length > 0 ? (existing[0]?.position ?? 0) + 1 : 1;

    const rawSkillName = input.skillName?.trim();
    let skillId: string | null = null;

    if (rawSkillName) {
      // Get character_id from daily_plans
      const { data: planData } = await supabase
        .from("daily_plans")
        .select("character_id")
        .eq("id", planId)
        .single();

      if (planData) {
        // Find existing character skill (case-insensitive)
        const { data: existingSkill } = await supabase
          .from("character_skills")
          .select("id")
          .eq("character_id", planData.character_id)
          .ilike("name", rawSkillName)
          .maybeSingle();

        if (existingSkill) {
          skillId = existingSkill.id;
        } else {
          // Create new skill with attribute tags
          const { data: newSkill, error: createSkillErr } = await supabase
            .from("character_skills")
            .insert({
              character_id: planData.character_id,
              name: rawSkillName,
              primary_attribute_id: input.primaryAttributeId ?? null,
              secondary_attribute_id: input.secondaryAttributeId ?? null,
            })
            .select("id")
            .single();

          if (!createSkillErr && newSkill) {
            skillId = newSkill.id;
          }
        }
      }
    }

    const { data, error } = await supabase
      .from("quests")
      .insert({
        daily_plan_id: planId,
        title: input.title,
        description: input.description ?? null,
        status: "pending",
        position: nextPosition,
        xp_reward: 10,
        attribute_id: null,
        skill_name: rawSkillName ?? null,
        hours: rawSkillName ? (input.hours ?? 1) : null,
        skill_id: skillId,
      })
      .select(QUEST_SELECT)
      .single();

    if (error) throw new Error(error.message);

    return mapQuestRow(data);
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
