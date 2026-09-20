import { supabase } from "@/shared/api/supabase/client";

import type { CharacterSkill } from "../model/characterSkillTypes";
import type { Character, CharacterAttribute, DailyState, XpEvent } from "../model/characterTypes";

export const characterRepository = {
  /**
   * Returns the character owned by the given Supabase auth user,
   * or null if onboarding hasn't been completed yet.
   */
  async getCurrentCharacter(userId: string): Promise<Character | null> {
    const { data, error } = await supabase
      .from("characters")
      .select("id, profile_id, name, class, level, total_xp, created_at")
      .eq("profile_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw new Error(error.message);
    }

    if (!data) return null;

    return {
      id: data.id,
      profileId: data.profile_id,
      name: data.name,
      class: (data.class as Character["class"]) ?? null,
      level: data.level,
      totalXp: data.total_xp,
      createdAt: data.created_at,
    };
  },

  /**
   * Returns all attribute definitions combined with character attribute values.
   * Fully data-driven: if a new attribute definition is added to DB, it will appear automatically.
   */
  async getCharacterAttributes(characterId: string): Promise<CharacterAttribute[]> {
    const [{ data: defs, error: defsErr }, { data: userAttrs, error: userAttrsErr }] =
      await Promise.all([
        supabase.from("attribute_definitions").select("id, code, name, description"),
        supabase
          .from("character_attributes")
          .select("id, attribute_id, value")
          .eq("character_id", characterId),
      ]);

    if (defsErr) throw new Error(defsErr.message);
    if (userAttrsErr) throw new Error(userAttrsErr.message);

    const userAttrMap = new Map((userAttrs ?? []).map((a) => [a.attribute_id, a]));

    return (defs ?? []).map((def) => {
      const userAttr = userAttrMap.get(def.id);
      return {
        id: userAttr?.id ?? def.id,
        attributeId: def.id,
        code: def.code,
        name: def.name,
        description: def.description ?? "",
        value: userAttr?.value ?? 1,
      };
    });
  },

  /**
   * Returns today's daily state for the character, or null if none exists yet.
   */
  async getTodayState(characterId: string): Promise<DailyState | null> {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const { data, error } = await supabase
      .from("daily_states")
      .select("id, date, energy, mood, fatigue, focus")
      .eq("character_id", characterId)
      .eq("date", today)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw new Error(error.message);
    }

    if (!data) return null;

    return {
      id: data.id,
      date: data.date,
      energy: data.energy,
      mood: data.mood,
      fatigue: data.fatigue,
      focus: data.focus,
    };
  },

  /**
   * Returns recent XP transactions for a character with linked report event details.
   */
  async getRecentXpEvents(characterId: string, limit = 20): Promise<XpEvent[]> {
    const { data, error } = await supabase
      .from("xp_transactions")
      .select("id, amount, reason, created_at, report_events(type, description)")
      .eq("character_id", characterId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => {
      const event = Array.isArray(row.report_events) ? row.report_events[0] : row.report_events;

      return {
        id: row.id,
        amount: row.amount,
        reason: row.reason,
        createdAt: row.created_at,
        eventType: event?.type ?? null,
        eventDescription: event?.description ?? null,
      };
    });
  },

  /**
   * Returns all user-defined skills for a character from character_skills table.
   * Skills are sorted by total_xp descending (highest first).
   */
  async getCharacterSkills(characterId: string): Promise<CharacterSkill[]> {
    const { data, error } = await supabase
      .from("character_skills")
      .select("id, character_id, name, total_hours, total_xp, last_practiced_at, created_at")
      .eq("character_id", characterId)
      .order("total_xp", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      characterId: row.character_id,
      name: row.name,
      totalHours: Number(row.total_hours),
      totalXp: row.total_xp,
      lastPracticedAt: row.last_practiced_at,
      createdAt: row.created_at,
    }));
  },
};
