/**
 * DayPlanStore on Supabase. Reads go through the USER's client (RLS); the plan parse log and its daily limit
 * use the service-role client (only the server writes the log).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { countRequestsSince, loadSkillsAndQuests } from "../_shared/ai/supabaseContext.ts";
import type { DayPlanStore, PlanAttemptLog, PlanParseContext } from "./types.ts";

export function createSupabaseStore(
  userClient: SupabaseClient,
  serviceClient: SupabaseClient,
): DayPlanStore {
  return {
    countParseRequestsSince: (userId, sinceIso) =>
      countRequestsSince(serviceClient, "day_plan_parses", userId, sinceIso),

    async loadContext(userId, dates): Promise<PlanParseContext> {
      const { skills, quests } = await loadSkillsAndQuests(userClient, userId, dates);
      return {
        skills,
        quests: quests.map((q) => ({
          id: q.id,
          date: q.plan_date,
          title: q.title,
          startTime: q.start_time ? q.start_time.slice(0, 5) : null,
          durationMinutes:
            q.duration_minutes ?? (q.hours != null ? Math.round(Number(q.hours) * 60) : null),
          status: q.status === "completed" ? "completed" : "pending",
        })),
      };
    },

    async logAttempt(log: PlanAttemptLog) {
      const { data, error } = await serviceClient
        .from("day_plan_parses")
        .insert({
          user_id: log.userId,
          plan_date: log.planDate,
          input_text: log.inputText,
          model: log.model,
          attempt: log.attempt,
          raw_output: log.rawOutput ?? null,
          parsed_items: log.parsedItems,
          status: log.status,
          error_message: log.errorMessage,
          latency_ms: log.latencyMs,
          usage: log.usage,
        })
        .select("id")
        .single();
      if (error || !data) throw new Error(`log attempt: ${error?.message ?? "no row"}`);
      return data.id as string;
    },
  };
}
