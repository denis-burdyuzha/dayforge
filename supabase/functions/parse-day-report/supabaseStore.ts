/**
 * DayReportStore on Supabase. Reads go through the USER's client (RLS: only their character, skills and
 * quests); the parse log and the daily limit use the service-role client (only the server writes the log).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { countRequestsSince, loadSkillsAndQuests } from "../_shared/ai/supabaseContext.ts";
import type { AttemptLog, DayReportStore, ParseContext } from "./types.ts";

export function createSupabaseStore(
  userClient: SupabaseClient,
  serviceClient: SupabaseClient,
): DayReportStore {
  return {
    countParseRequestsSince: (userId, sinceIso) =>
      countRequestsSince(serviceClient, "day_report_parses", userId, sinceIso),

    async loadContext(userId, reportDate): Promise<ParseContext> {
      const { skills, quests } = await loadSkillsAndQuests(userClient, userId, reportDate);
      return {
        skills,
        // only pending quests can be linked to an event of the day
        plannedQuests: quests
          .filter((q) => q.status === "pending")
          .map((q) => ({
            id: q.id,
            title: q.title,
            skill: q.skill_name,
            startTime: q.start_time ? q.start_time.slice(0, 5) : null,
          })),
      };
    },

    async logAttempt(log: AttemptLog) {
      const { data, error } = await serviceClient
        .from("day_report_parses")
        .insert({
          user_id: log.userId,
          report_date: log.reportDate,
          input_text: log.inputText,
          model: log.model,
          attempt: log.attempt,
          raw_output: log.rawOutput ?? null,
          parsed_events: log.parsedEvents,
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
