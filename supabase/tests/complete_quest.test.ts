/**
 * Regression test for complete_quest: pins its behaviour so that extracting the shared completion core
 * (for apply_day_report) cannot change it.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

import { asUser, createTestDb } from "./pglite/db";

const here = path.dirname(fileURLToPath(import.meta.url));
const USER_A = "11111111-1111-1111-1111-111111111111";
const USER_B = "22222222-2222-2222-2222-222222222222";
const RUN_QUEST = "90000000-0000-0000-0000-000000000001";

let db: PGlite;

beforeAll(async () => {
  db = await createTestDb();
  await db.exec(readFileSync(path.join(here, "pglite/seed.sql"), "utf8"));
}, 60_000);

describe("complete_quest", () => {
  it("completes a quest: XP, level curve, attribute +1, skill XP with form", async () => {
    const res = await asUser<{ r: Record<string, unknown> }>(
      db,
      USER_A,
      "select public.complete_quest($1) as r",
      [RUN_QUEST],
    );
    expect(res.rows[0]?.r).toEqual({
      success: true,
      xpAwarded: 10,
      oldLevel: 1,
      newLevel: 1,
      nextLevelThreshold: 20,
      attributeGained: 1,
      skillXpGained: 20,
      skillLevel: 2,
    });

    const state = await db.query<{
      total_xp: number;
      endurance: number;
      skill_xp: number;
      status: string;
    }>(`
      select c.total_xp,
             (select value from character_attributes ca join attribute_definitions ad on ad.id = ca.attribute_id
               where ca.character_id = c.id and ad.code = 'endurance') as endurance,
             (select total_xp from character_skills where id = '5a000000-0000-0000-0000-000000000002') as skill_xp,
             (select status from quests where id = '${RUN_QUEST}') as status
      from characters c where c.profile_id = '${USER_A}'`);
    expect(state.rows[0]).toEqual({
      total_xp: 10,
      endurance: 2,
      skill_xp: 20,
      status: "completed",
    });
  });

  it("is idempotent: a completed quest awards nothing", async () => {
    const res = await asUser<{ r: Record<string, unknown> }>(
      db,
      USER_A,
      "select public.complete_quest($1) as r",
      [RUN_QUEST],
    );
    expect(res.rows[0]?.r).toMatchObject({
      success: false,
      message: "Quest already completed",
      xpAwarded: 0,
    });
    const xp = await db.query<{ total_xp: number }>(
      `select total_xp from characters where profile_id = '${USER_A}'`,
    );
    expect(xp.rows[0]?.total_xp).toBe(10);
  });

  it("refuses another user's quest", async () => {
    await expect(
      asUser(db, USER_B, "select public.complete_quest($1) as r", [RUN_QUEST]),
    ).rejects.toThrow(/does not belong/);
  });
});
