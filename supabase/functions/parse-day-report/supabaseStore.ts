/**
 * DayReportStore on Supabase. Reads go through the USER's client (RLS: only their character, skills and
 * quests); the parse log and the daily limit use the service-role client (only the server writes the log).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { ATTRIBUTE_CODES, type AttributeCode } from "./schema.ts";
import type { AttemptLog, DayReportStore, ParseContext } from "./types.ts";

const isAttributeCode = (code: unknown): code is AttributeCode =>
  typeof code === "string" && (ATTRIBUTE_CODES as readonly string[]).includes(code);

export function createSupabaseStore(
  userClient: SupabaseClient,
  serviceClient: SupabaseClient,
): DayReportStore {
  return {
    async countParseRequestsSince(userId, sinceIso) {
      const { count, error } = await serviceClient
        .from("day_report_parses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("attempt", 1)
        .gte("created_at", sinceIso);
      if (error) throw new Error(`count parses: ${error.message}`);
      return count ?? 0;
    },

    async loadContext(userId, reportDate): Promise<ParseContext> {
      const { data: character, error: charError } = await userClient
        .from("characters")
        .select("id")
        .eq("profile_id", userId)
        .maybeSingle();
      if (charError) throw new Error(`character: ${charError.message}`);
      if (!character) return { skills: [], plannedQuests: [] };

      const [defsRes, skillsRes, planRes] = await Promise.all([
        userClient.from("attribute_definitions").select("id, code"),
        userClient
          .from("character_skills")
          .select("id, name, aliases, primary_attribute_id, secondary_attribute_id")
          .eq("character_id", character.id),
        userClient
          .from("daily_plans")
          .select("id")
          .eq("character_id", character.id)
          .eq("date", reportDate)
          .maybeSingle(),
      ]);
      if (defsRes.error) throw new Error(`attributes: ${defsRes.error.message}`);
      if (skillsRes.error) throw new Error(`skills: ${skillsRes.error.message}`);
      if (planRes.error) throw new Error(`plan: ${planRes.error.message}`);

      const codeById = new Map<string, unknown>(
        (defsRes.data ?? []).map((d: { id: string; code: unknown }) => [d.id, d.code]),
      );
      const skills = (skillsRes.data ?? []).map(
        (s: {
          id: string;
          name: string;
          aliases: string[] | null;
          primary_attribute_id: string | null;
          secondary_attribute_id: string | null;
        }) => ({
          id: s.id,
          name: s.name,
          aliases: s.aliases ?? [],
          attributes: [s.primary_attribute_id, s.secondary_attribute_id]
            .map((id) => (id ? codeById.get(id) : undefined))
            .filter(isAttributeCode),
        }),
      );

      let plannedQuests: ParseContext["plannedQuests"] = [];
      if (planRes.data) {
        const { data: quests, error: questsError } = await userClient
          .from("quests")
          .select("id, title, skill_name")
          .eq("daily_plan_id", planRes.data.id)
          .eq("status", "pending")
          .order("position");
        if (questsError) throw new Error(`quests: ${questsError.message}`);
        plannedQuests = (quests ?? []).map(
          (q: { id: string; title: string; skill_name: string | null }) => ({
            id: q.id,
            title: q.title,
            skill: q.skill_name,
          }),
        );
      }
      return { skills, plannedQuests };
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
        })
        .select("id")
        .single();
      if (error || !data) throw new Error(`log attempt: ${error?.message ?? "no row"}`);
      return data.id as string;
    },
  };
}
