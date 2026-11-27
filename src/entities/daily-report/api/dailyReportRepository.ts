import { supabase } from "@/shared/api/supabase/client";
import { getUserDayRangeIso } from "@/shared/lib/userDay";

import type { DailyReport, DayCompletionResult } from "../model/dailyReportTypes";

export const dailyReportRepository = {
  /**
   * Returns today'"'"'s report for the character, or null if none completed yet.
   */
  async getReport(characterId: string, date: string): Promise<DailyReport | null> {
    const today = date;

    const { data, error } = await supabase
      .from("daily_reports")
      .select("id, character_id, date, content, created_at")
      .eq("character_id", characterId)
      .eq("date", today)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw new Error(error.message);
    }

    if (!data) return null;

    return {
      id: data.id,
      characterId: data.character_id,
      date: data.date,
      content: data.content,
      createdAt: data.created_at,
    };
  },

  /**
   * Completes the day:
   * 1. Upsert daily_reports row with the free-text content
   * 2. Aggregate XP earned today (sum of xp_transactions for this character today)
   * 3. Calculate attribute deltas from today'"'"'s completed quests with attribute_id
   * 4. Return DayCompletionResult (no extra XP awarded here — already done per quest)
   */
  async completeDay(
    characterId: string,
    date: string,
    dayStartTime: string,
    text: string,
  ): Promise<DayCompletionResult> {
    const today = date;

    // 1. Upsert report (RPC save_daily_report — the client never writes game tables directly)
    const { data: savedReport, error: reportError } = await supabase.rpc("save_daily_report", {
      p_date: today,
      p_content: text,
    });

    if (reportError) throw new Error(reportError.message);

    const reportData = savedReport as {
      id: string;
      character_id: string;
      date: string;
      content: string;
      created_at: string;
    };

    // 2. Aggregate XP gained today
    // bounds of the user's day (from the day boundary to the next one), not the UTC day
    const { start: todayStart, end: todayEnd } = getUserDayRangeIso(today, dayStartTime);

    const { data: txRows, error: txError } = await supabase
      .from("xp_transactions")
      .select("amount")
      .eq("character_id", characterId)
      .gte("created_at", todayStart)
      .lte("created_at", todayEnd);

    if (txError) throw new Error(txError.message);

    const totalXpGained = (txRows ?? []).reduce((sum, row) => sum + row.amount, 0);

    // 3. Calculate attribute deltas from today'"'"'s completed quests with attribute_id
    // Get today'"'"'s plan
    const { data: plan } = await supabase
      .from("daily_plans")
      .select("id")
      .eq("character_id", characterId)
      .eq("date", today)
      .maybeSingle();

    const attributeDeltas: DayCompletionResult["attributeDeltas"] = [];

    if (plan) {
      const { data: completedQuests } = await supabase
        .from("quests")
        .select("xp_reward, attribute_id, attribute_definitions(id, code, name)")
        .eq("daily_plan_id", plan.id)
        .eq("status", "completed")
        .not("attribute_id", "is", null);

      // Aggregate XP per attribute
      const attrMap = new Map<
        string,
        { attributeId: string; code: string; name: string; delta: number }
      >();

      for (const quest of completedQuests ?? []) {
        if (!quest.attribute_id) continue;
        const def = Array.isArray(quest.attribute_definitions)
          ? quest.attribute_definitions[0]
          : quest.attribute_definitions;
        if (!def) continue;

        const key = quest.attribute_id;
        const existing = attrMap.get(key);
        if (existing) {
          existing.delta += quest.xp_reward;
        } else {
          attrMap.set(key, {
            attributeId: quest.attribute_id,
            code: def.code,
            name: def.name,
            delta: quest.xp_reward,
          });
        }
      }

      attributeDeltas.push(...attrMap.values());
    }

    // 4. Check character level for level-up detection
    const { data: character, error: charError } = await supabase
      .from("characters")
      .select("level")
      .eq("id", characterId)
      .single();

    if (charError) throw new Error(charError.message);

    // The level was already updated per-quest via dailyPlanRepository.completeQuest
    // We just read the current level to report it. We track level-up by comparing
    // the level at start of the day with current: but since we don'"'"'t persist start-level,
    // we use a heuristic: if totalXpGained pushed across a threshold, it leveled up.
    // For simplicity: if the character'"'"'s level > 1 and totalXpGained > 0, show current level.
    // The actual level-up flag is surfaced when completeDay is called by checking
    // whether level changed during this session (tracked by DailyReportPage state).
    const newLevel = character.level;

    return {
      report: {
        id: reportData.id,
        characterId: reportData.character_id,
        date: reportData.date,
        content: reportData.content,
        createdAt: reportData.created_at,
      },
      totalXpGained,
      attributeDeltas,
      leveledUp: false, // resolved by caller comparing old vs new level
      newLevel,
    };
  },
};
