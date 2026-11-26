/**
 * Context reads shared by the AI stores, through the USER's client (RLS: only their character, skills,
 * quests), and the request counter for the daily limits (service client: the logs are server-only).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { isAttributeCode } from "./catalog.ts";
import type { SkillContext } from "./skills.ts";

export interface QuestRow {
  id: string;
  title: string;
  status: string;
  skill_name: string | null;
  start_time: string | null;
  duration_minutes: number | null;
  hours: number | null;
}

/** The user's skills (with attribute codes) and the quests of `date` (all statuses, by position) */
export async function loadSkillsAndQuests(
  userClient: SupabaseClient,
  userId: string,
  date: string,
): Promise<{ skills: SkillContext[]; quests: QuestRow[] }> {
  const { data: character, error: charError } = await userClient
    .from("characters")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();
  if (charError) throw new Error(`character: ${charError.message}`);
  if (!character) return { skills: [], quests: [] };

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
      .eq("date", date)
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
    }): SkillContext => ({
      id: s.id,
      name: s.name,
      aliases: s.aliases ?? [],
      attributes: [s.primary_attribute_id, s.secondary_attribute_id]
        .map((id) => (id ? codeById.get(id) : undefined))
        .filter(isAttributeCode),
    }),
  );

  let quests: QuestRow[] = [];
  if (planRes.data) {
    const { data, error } = await userClient
      .from("quests")
      .select("id, title, status, skill_name, start_time, duration_minutes, hours")
      .eq("daily_plan_id", planRes.data.id)
      .order("position");
    if (error) throw new Error(`quests: ${error.message}`);
    quests = (data ?? []) as QuestRow[];
  }
  return { skills, quests };
}

/** First attempts (= requests) of the user in `table` since `sinceIso` */
export async function countRequestsSince(
  serviceClient: SupabaseClient,
  table: "day_report_parses" | "day_plan_parses",
  userId: string,
  sinceIso: string,
): Promise<number> {
  const { count, error } = await serviceClient
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("attempt", 1)
    .gte("created_at", sinceIso);
  if (error) throw new Error(`count ${table}: ${error.message}`);
  return count ?? 0;
}
