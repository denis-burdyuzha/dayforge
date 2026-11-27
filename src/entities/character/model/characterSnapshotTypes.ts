/**
 * Daily character snapshot (table character_snapshots): the character state after the last credit of a local
 * date. Written only by the database (completion of quests / day reports, onboarding); read for the future
 * evolution replay. One row per character and date.
 */
import type { Json } from "@/shared/api/supabase/database.types";

import { isAttributeKey } from "./aspect";
import type { AttributeKey } from "./types";

export interface SnapshotSkill {
  id: string;
  name: string;
  icon: string | null;
  level: number;
  totalXp: number;
  totalHours: number;
}

export interface CharacterSnapshot {
  /** "YYYY-MM-DD" — the user's local date */
  date: string;
  level: number;
  /** avatar asset tier 1..5 (same thresholds as assetTierForLevel) */
  tier: number;
  totalXp: number;
  /** all 7 attributes */
  attributes: Partial<Record<AttributeKey, number>>;
  aspect: AttributeKey | null;
  /** up to 5 skills with the highest total XP, highest first */
  topSkills: SnapshotSkill[];
  skillsCount: number;
  relics: Json[];
}

export interface CharacterSnapshotRow {
  snapshot_date: string;
  level: number;
  tier: number;
  total_xp: number;
  attributes: Json;
  aspect: string | null;
  top_skills: Json;
  skills_count: number;
  relics: Json;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const num = (v: unknown): number => (typeof v === "number" ? v : Number(v ?? 0) || 0);

export function mapSnapshotRow(row: CharacterSnapshotRow): CharacterSnapshot {
  const attributes: Partial<Record<AttributeKey, number>> = {};
  if (isRecord(row.attributes)) {
    for (const [code, value] of Object.entries(row.attributes)) {
      if (isAttributeKey(code)) attributes[code] = num(value);
    }
  }
  const topSkills: SnapshotSkill[] = (Array.isArray(row.top_skills) ? row.top_skills : []).flatMap(
    (s: unknown) =>
      isRecord(s)
        ? [
            {
              id: String(s.id ?? ""),
              name: String(s.name ?? ""),
              icon: typeof s.icon === "string" ? s.icon : null,
              level: num(s.level),
              totalXp: num(s.total_xp),
              totalHours: num(s.total_hours),
            },
          ]
        : [],
  );
  return {
    date: row.snapshot_date,
    level: row.level,
    tier: row.tier,
    totalXp: row.total_xp,
    attributes,
    aspect: row.aspect !== null && isAttributeKey(row.aspect) ? row.aspect : null,
    topSkills,
    skillsCount: row.skills_count,
    relics: Array.isArray(row.relics) ? row.relics : [],
  };
}
