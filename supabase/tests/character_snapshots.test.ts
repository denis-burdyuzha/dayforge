/**
 * Daily character snapshots on PGlite with all migrations: written by the completion core (complete_quest,
 * apply_day_report) and complete_onboarding, one row per (character, date), owner-only reads; the SQL aspect
 * and tier rules match the client ones. Seed: supabase/tests/pglite/seed.sql.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

import {
  ATTRIBUTE_ORDER,
  type AttributeValues,
  getAspect,
} from "../../src/entities/character/model/aspect";
import { assetTierForLevel } from "../../src/entities/character/ui/ModularAvatar/tierFx";
import { asUser, createTestDb } from "./pglite/db";

const here = path.dirname(fileURLToPath(import.meta.url));
const USER_A = "11111111-1111-1111-1111-111111111111";
const USER_B = "22222222-2222-2222-2222-222222222222";
const USER_C = "33333333-3333-3333-3333-333333333333";
const CHAR_A = "aaaaaaaa-0000-0000-0000-00000000000a";
const RUN_QUEST = "90000000-0000-0000-0000-000000000001"; // 2026-11-20, skill «Бег» (endurance), 1h
const SKILL_RUN = "5a000000-0000-0000-0000-000000000002";

interface SnapshotRow {
  snapshot_date: string;
  level: number;
  tier: number;
  total_xp: number;
  attributes: Record<string, number>;
  aspect: string | null;
  top_skills: Array<{
    id: string;
    name: string;
    icon: string | null;
    level: number;
    total_xp: number;
    total_hours: number;
  }>;
  skills_count: number;
  relics: unknown[];
  created_at: string;
  updated_at: string;
}

let db: PGlite;

const snapshotsOf = async (characterId: string) =>
  (
    await db.query<SnapshotRow>(
      `select to_char(snapshot_date, 'YYYY-MM-DD') as snapshot_date, level, tier, total_xp, attributes, aspect,
              top_skills, skills_count, relics, created_at::text, updated_at::text
       from public.character_snapshots where character_id = $1 order by snapshot_date`,
      [characterId],
    )
  ).rows;

/** a pending quest of user A on `date` with skill «Бег», 1h (plan created if missing) */
async function addRunQuest(id: string, date: string) {
  await db.query(
    `insert into public.daily_plans (character_id, date) values ($1, $2)
     on conflict (character_id, date) do nothing`,
    [CHAR_A, date],
  );
  await db.query(
    `insert into public.quests (id, daily_plan_id, title, status, position, skill_id, skill_name, hours)
     select $1, dp.id, 'Пробежка', 'pending', 10, $2, 'Бег', 1
     from public.daily_plans dp where dp.character_id = $3 and dp.date = $4`,
    [id, SKILL_RUN, CHAR_A, date],
  );
}

const complete = (questId: string) =>
  asUser(db, USER_A, "select public.complete_quest($1) as r", [questId]);

beforeAll(async () => {
  db = await createTestDb();
  await db.exec(readFileSync(path.join(here, "pglite/seed.sql"), "utf8"));
}, 60_000);

describe("character snapshots", () => {
  it("completing a quest writes the snapshot of the quest's date", async () => {
    expect(await snapshotsOf(CHAR_A)).toEqual([]);
    await complete(RUN_QUEST);

    const rows = await snapshotsOf(CHAR_A);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      snapshot_date: "2026-11-20",
      level: 1,
      tier: 1,
      total_xp: 10,
      aspect: null,
      skills_count: 2,
      relics: [],
    });
    expect(rows[0]?.attributes).toEqual({
      strength: 1,
      endurance: 2,
      intelligence: 1,
      focus: 1,
      discipline: 1,
      social: 1,
      creativity: 1,
    });
    // ordered by total_xp: «Бег» (20 XP after the quest) first
    expect(rows[0]?.top_skills[0]).toEqual({
      id: SKILL_RUN,
      name: "Бег",
      icon: null,
      level: 2,
      total_xp: 20,
      total_hours: 1,
    });
    expect(rows[0]?.top_skills).toHaveLength(2);
  });

  it("a second credit on the same date updates the row instead of adding one", async () => {
    const before = (await snapshotsOf(CHAR_A))[0];
    await addRunQuest("90000000-0000-0000-0000-0000000000a1", "2026-11-20");
    await complete("90000000-0000-0000-0000-0000000000a1");

    const rows = await snapshotsOf(CHAR_A);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ snapshot_date: "2026-11-20", total_xp: 20, level: 2 });
    expect(rows[0]?.attributes.endurance).toBe(3);
    expect(rows[0]?.aspect).toBe("endurance"); // 3 and strictly above the others (1)
    expect(rows[0]?.created_at).toBe(before?.created_at);
  });

  it("a credit on another date adds a new row; the earlier day keeps its state", async () => {
    await addRunQuest("90000000-0000-0000-0000-0000000000a2", "2026-11-21");
    await complete("90000000-0000-0000-0000-0000000000a2");

    const rows = await snapshotsOf(CHAR_A);
    expect(rows.map((r) => r.snapshot_date)).toEqual(["2026-11-20", "2026-11-21"]);
    expect(rows[0]?.total_xp).toBe(20);
    expect(rows[1]?.total_xp).toBe(30);
    expect(rows[1]?.attributes.endurance).toBe(4);
  });

  it("apply_day_report writes the snapshot of the report date", async () => {
    await db.query(
      `insert into public.day_report_parses (id, user_id, report_date, input_text, model, status)
       values ('a5000000-0000-0000-0000-000000000001', $1, '2026-11-23', 't', 'm', 'ok')`,
      [USER_A],
    );
    await asUser(db, USER_A, "select public.apply_day_report($1, $2, $3) as r", [
      "2026-11-23",
      JSON.stringify([
        { description: "Пробежка", hours: 1, skill: { kind: "existing", skill_id: SKILL_RUN } },
      ]),
      "a5000000-0000-0000-0000-000000000001",
    ]);
    const rows = await snapshotsOf(CHAR_A);
    expect(rows.map((r) => r.snapshot_date)).toEqual(["2026-11-20", "2026-11-21", "2026-11-23"]);
    expect(rows[2]?.total_xp).toBeGreaterThan(30);
  });

  it("complete_onboarding writes the first snapshot on the client's local date", async () => {
    await db.query(
      `insert into auth.users (id, email, raw_user_meta_data)
       values ($1, 'c@test.local', '{"username":"user_c"}')`,
      [USER_C],
    );
    const res = await asUser<{ r: { character_id: string } }>(
      db,
      USER_C,
      "select public.complete_onboarding($1, $2, $3, $4, $5) as r",
      ["user_c", "Гамма", "creator", ["fitness"], "2026-11-24"],
    );
    const characterId = res.rows[0]?.r.character_id ?? "";
    const rows = await snapshotsOf(characterId);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      snapshot_date: "2026-11-24",
      level: 1,
      tier: 1,
      total_xp: 0,
      aspect: null,
      top_skills: [],
      skills_count: 0,
    });
    expect(Object.values(rows[0]?.attributes ?? {})).toEqual([1, 1, 1, 1, 1, 1, 1]);
  });

  it("the owner reads only their own snapshots and cannot write them", async () => {
    const own = await asUser<{ n: number }>(
      db,
      USER_A,
      "select count(*)::int as n from public.character_snapshots",
    );
    expect(own.rows[0]?.n).toBe(3);
    const foreign = await asUser<{ n: number }>(
      db,
      USER_B,
      "select count(*)::int as n from public.character_snapshots where character_id = $1",
      [CHAR_A],
    );
    expect(foreign.rows[0]?.n).toBe(0);

    await expect(
      asUser(db, USER_A, "update public.character_snapshots set total_xp = 9999"),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asUser(
        db,
        USER_B,
        `insert into public.character_snapshots (character_id, snapshot_date, level, tier, total_xp, attributes)
         values ($1, '2026-12-01', 99, 5, 0, '{}')`,
        [CHAR_A],
      ),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asUser(db, USER_A, "select public._upsert_character_snapshot($1, '2026-12-01')", [CHAR_A]),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("SQL rules match the client", () => {
  it("_snapshot_aspect == getAspect on the same inputs", async () => {
    // deterministic pseudo-random values (0..6, so ties and the ≥ 3 threshold are frequent) + edge cases
    let seed = 42;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) % 2 ** 31;
      return seed / 2 ** 31;
    };
    const cases: AttributeValues[] = [
      {},
      { strength: 3 },
      { strength: 2 },
      { creativity: 3, strength: 3 },
      { focus: 5, social: 4 },
      { discipline: 18, endurance: 17 },
    ];
    for (let i = 0; i < 400; i++) {
      const c: AttributeValues = {};
      for (const key of ATTRIBUTE_ORDER) {
        if (rnd() < 0.9) c[key] = Math.floor(rnd() * 7);
      }
      cases.push(c);
    }
    const res = await db.query<{ ord: number; aspect: string | null }>(
      `select ord::int, public._snapshot_aspect(value) as aspect
       from jsonb_array_elements($1::jsonb) with ordinality e(value, ord) order by ord`,
      [JSON.stringify(cases)],
    );
    const sql = res.rows.map((r) => r.aspect);
    expect(sql).toEqual(cases.map((c) => getAspect(c)));
    expect(sql.filter((a) => a !== null).length).toBeGreaterThan(50); // the cases do exercise both outcomes
  });

  it("_snapshot_tier == assetTierForLevel", async () => {
    const levels = Array.from({ length: 70 }, (_, i) => i + 1);
    const res = await db.query<{ tier: number }>(
      "select public._snapshot_tier(l) as tier from unnest($1::int[]) with ordinality u(l, ord) order by ord",
      [levels],
    );
    expect(res.rows.map((r) => r.tier)).toEqual(levels.map(assetTierForLevel));
  });

  it("_skill_level_for_xp == the skill level curve", async () => {
    const res = await db.query<{ xp: number; level: number }>(
      "select xp, public._skill_level_for_xp(xp) as level from unnest(array[0, 19, 20, 59, 60, 119, 120]) xp",
    );
    expect(res.rows.map((r) => r.level)).toEqual([1, 1, 2, 2, 3, 3, 4]);
  });
});
