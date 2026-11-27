/**
 * apply_day_plan on PGlite with all migrations: idempotency, the 960-minute plan limit, skill dedup, quests
 * without a skill (0 XP on completion), foreign skill ids, validation. Seed: supabase/tests/pglite/seed.sql.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";

import { asUser, createTestDb } from "./pglite/db";

const here = path.dirname(fileURLToPath(import.meta.url));
const USER_A = "11111111-1111-1111-1111-111111111111";
const USER_B = "22222222-2222-2222-2222-222222222222";
const CHAR_A = "aaaaaaaa-0000-0000-0000-00000000000a";
const SKILL_EN = "5a000000-0000-0000-0000-000000000001";
const SKILL_B_GUITAR = "5b000000-0000-0000-0000-000000000001";
const DATE = "2026-11-20"; // seed: pending «Пробежка» 1h (60 min) + completed «Чтение»
const FREE_DATE = "2026-11-22";

interface PlanResult {
  success: boolean;
  planId: string;
  planDate: string;
  quests: Array<{
    id: string;
    title: string;
    startTime: string | null;
    durationMinutes: number;
    skillId: string | null;
    skillName: string | null;
    createdSkill: boolean;
  }>;
  newSkills: Array<{ id: string; name: string; icon: string | null; attributes: string[] }>;
  totalMinutes: number;
  replayed?: boolean;
}

const item = (over: Record<string, unknown> = {}) => ({
  title: "Дело",
  start_time: null,
  duration_minutes: 30,
  skill: { kind: "none" },
  ...over,
});

let db: PGlite;
let parseSeq = 0;

/** a successful plan parse of `userId` for `date`, as the Edge Function would log it */
async function newParse(userId = USER_A, date = DATE, status = "ok") {
  parseSeq += 1;
  const id = `c0000000-0000-0000-0000-${String(parseSeq).padStart(12, "0")}`;
  await db.query(
    `insert into public.day_plan_parses (id, user_id, plan_date, input_text, model, status)
     values ($1, $2, $3, 't', 'm', $4)`,
    [id, userId, date, status],
  );
  return id;
}

async function apply(items: unknown[], parseId: string, date = DATE, userId = USER_A) {
  const res = await asUser<{ r: PlanResult }>(
    db,
    userId,
    "select public.apply_day_plan($1, $2::jsonb, $3) as r",
    [date, JSON.stringify(items), parseId],
  );
  return res.rows[0]!.r;
}

async function count(sql: string, params: unknown[] = []) {
  const res = await db.query<{ n: number }>(`select (${sql})::int as n`, params);
  return res.rows[0]!.n;
}

beforeEach(async () => {
  db = await createTestDb();
  await db.exec(readFileSync(path.join(here, "pglite/seed.sql"), "utf8"));
  await db.exec(
    `update public.character_skills set aliases = array['англ', 'English'] where id = '${SKILL_EN}'`,
  );
}, 60_000);

describe("apply_day_plan", () => {
  it("creates pending ai_plan quests in time order with hours = duration/60; repeat = stored result", async () => {
    const parseId = await newParse();
    const items = [
      item({
        title: "Вечерний английский",
        start_time: "19:00",
        duration_minutes: 45,
        skill: { kind: "existing", skill_id: SKILL_EN },
      }),
      item({ title: "Купить продукты", start_time: null, duration_minutes: 20 }),
      item({
        title: "Пробежка в парке",
        start_time: "07:30",
        duration_minutes: 30,
        skill: { kind: "new", name: " Бег ", attributes: ["endurance"], icon: "running" },
      }),
    ];
    const first = await apply(items, parseId);

    expect(first.success).toBe(true);
    expect(first.quests.map((q) => [q.title, q.startTime])).toEqual([
      ["Пробежка в парке", "07:30"],
      ["Вечерний английский", "19:00"],
      ["Купить продукты", null],
    ]);
    // «Бег» exists in the seed → dedup, nothing created
    expect(first.quests[0]).toMatchObject({ skillName: "Бег", createdSkill: false });
    expect(first.newSkills).toEqual([]);
    // 60 min pending in the seed + 95 new
    expect(first.totalMinutes).toBe(155);

    const rows = await db.query<{
      title: string;
      status: string;
      source: string;
      hours: string;
      duration_minutes: number;
      start_time: string | null;
      skill_id: string | null;
    }>(
      `select title, status, source, hours::text, duration_minutes, start_time::text, skill_id
       from public.quests where source = 'ai_plan' order by position`,
    );
    expect(rows.rows).toEqual([
      expect.objectContaining({
        title: "Пробежка в парке",
        status: "pending",
        hours: "0.50",
        duration_minutes: 30,
        start_time: "07:30:00",
      }),
      expect.objectContaining({ title: "Вечерний английский", hours: "0.75", skill_id: SKILL_EN }),
      expect.objectContaining({
        title: "Купить продукты",
        hours: "0.33",
        start_time: null,
        skill_id: null,
      }),
    ]);

    const again = await apply([item({ title: "Другое" })], parseId);
    expect(again.replayed).toBe(true);
    expect(again.quests).toHaveLength(3);
    expect(await count("select count(*) from public.quests where source = 'ai_plan'")).toBe(3);
  });

  it("PLAN_HOURS_LIMIT: pending minutes of the date + new > 960 → error, nothing written", async () => {
    const parseId = await newParse();
    // seed has 60 pending minutes; 2 × 450 = 900 → 960 is allowed exactly
    const ok = await apply(
      [item({ duration_minutes: 450 }), item({ duration_minutes: 450 })],
      parseId,
    );
    expect(ok.totalMinutes).toBe(960);

    const second = await newParse();
    const err = await asUser(db, USER_A, "select public.apply_day_plan($1, $2::jsonb, $3)", [
      DATE,
      JSON.stringify([item({ duration_minutes: 5 })]),
      second,
    ]).catch((e: { message: string; detail?: string }) => e);
    expect(err).toMatchObject({ message: "PLAN_HOURS_LIMIT" });
    expect(JSON.parse((err as { detail: string }).detail)).toEqual({
      date: DATE,
      existingMinutes: 960,
      newMinutes: 5,
      totalMinutes: 965,
      limit: 960,
    });
    expect(await count("select count(*) from public.quests where source = 'ai_plan'")).toBe(2);
    // the failed apply did not claim the parse: it can be retried after editing
    expect(
      await count("select count(*) from public.day_plan_applications where parse_id = $1", [
        second,
      ]),
    ).toBe(0);
  });

  it("completed quests do not count towards the limit; a manual quest without duration counts by hours", async () => {
    // seed: «Пробежка» pending 1h → 60 min; complete it via complete_quest → 0 pending minutes
    await asUser(
      db,
      USER_A,
      "select public.complete_quest('90000000-0000-0000-0000-000000000001')",
    );
    const res = await apply(
      [item({ duration_minutes: 480 }), item({ duration_minutes: 480 })],
      await newParse(),
    );
    expect(res.totalMinutes).toBe(960);
  });

  it("new skill: dedup by alias and between items, otherwise created with 1–2 attributes in order", async () => {
    const res = await apply(
      [
        item({
          title: "Урок",
          start_time: "10:00",
          skill: { kind: "new", name: "ENGLISH", attributes: ["social"], icon: "languages" },
        }),
        item({
          title: "Шахматы утром",
          start_time: "08:00",
          skill: {
            kind: "new",
            name: "Шахматы",
            attributes: ["intelligence", "focus"],
            icon: "chess",
          },
        }),
        item({
          title: "Шахматы вечером",
          start_time: "20:00",
          skill: { kind: "new", name: "шахматы", attributes: ["focus"], icon: "chess" },
        }),
      ],
      await newParse(USER_A, FREE_DATE),
      FREE_DATE,
    );
    expect(res.quests.map((q) => [q.title, q.skillName, q.createdSkill])).toEqual([
      ["Шахматы утром", "Шахматы", true],
      ["Урок", "Английский", false],
      ["Шахматы вечером", "Шахматы", false],
    ]);
    expect(res.newSkills).toEqual([
      expect.objectContaining({
        name: "Шахматы",
        icon: "chess",
        attributes: ["intelligence", "focus"],
      }),
    ]);
    expect(
      await count(
        `select count(*) from public.character_skills cs
         where cs.character_id = '${CHAR_A}' and cs.name = 'Шахматы'
           and cs.primary_attribute_id = (select id from public.attribute_definitions where code = 'intelligence')
           and cs.secondary_attribute_id = (select id from public.attribute_definitions where code = 'focus')`,
      ),
    ).toBe(1);
    // a plan was created for the free date
    expect(
      await count(
        `select count(*) from public.daily_plans where character_id = '${CHAR_A}' and date = '${FREE_DATE}'`,
      ),
    ).toBe(1);
  });

  it("a quest without a skill completes with 0 XP and no attribute change", async () => {
    const res = await apply(
      [item({ title: "Позвонить в банк", duration_minutes: 15 })],
      await newParse(),
    );
    const questId = res.quests[0]!.id;
    const before = await count(
      `select sum(value) from public.character_attributes where character_id = '${CHAR_A}'`,
    );

    const done = await asUser<{ r: Record<string, unknown> }>(
      db,
      USER_A,
      "select public.complete_quest($1) as r",
      [questId],
    );
    expect(done.rows[0]!.r).toMatchObject({
      success: true,
      xpAwarded: 0,
      attributeGained: 0,
      skillXpGained: 0,
    });
    expect(await count(`select total_xp from public.characters where id = '${CHAR_A}'`)).toBe(0);
    expect(
      await count(
        `select sum(value) from public.character_attributes where character_id = '${CHAR_A}'`,
      ),
    ).toBe(before);
    expect(
      await count(`select count(*) from public.xp_transactions where character_id = '${CHAR_A}'`),
    ).toBe(0);
    expect(
      await count("select count(*) from public.quests where id = $1 and status = 'completed'", [
        questId,
      ]),
    ).toBe(1);
  });

  it("refuses a foreign skill id, a foreign parse and a parse of another date; nothing written", async () => {
    const foreign = await asUser(db, USER_A, "select public.apply_day_plan($1, $2::jsonb, $3)", [
      DATE,
      JSON.stringify([item({ skill: { kind: "existing", skill_id: SKILL_B_GUITAR } })]),
      await newParse(),
    ]).catch((e: Error) => e);
    expect(foreign).toMatchObject({ message: "SKILL_NOT_FOUND" });

    const parseOfB = await newParse(USER_B);
    await expect(apply([item()], parseOfB)).rejects.toMatchObject({ message: "PARSE_NOT_FOUND" });
    await expect(apply([item()], await newParse(USER_A, FREE_DATE))).rejects.toMatchObject({
      message: "PARSE_NOT_FOUND",
    });
    await expect(
      apply([item()], await newParse(USER_A, DATE, "invalid_output")),
    ).rejects.toMatchObject({
      message: "PARSE_NOT_FOUND",
    });
    expect(await count("select count(*) from public.quests where source = 'ai_plan'")).toBe(0);
  });

  it("validation: duration 5–480 and whole, title, time format, attributes 1–2 known codes", async () => {
    const cases: Array<[unknown[], string]> = [
      [[item({ duration_minutes: 4 })], "INVALID_DURATION"],
      [[item({ duration_minutes: 481 })], "INVALID_DURATION"],
      [[item({ duration_minutes: 12.5 })], "INVALID_DURATION"],
      [[item({ title: "   " })], "INVALID_ITEMS"],
      [[item({ start_time: "25:00" })], "INVALID_ITEMS"],
      [[], "INVALID_ITEMS"],
      [[item({ skill: { kind: "new", name: "Х", attributes: [] } })], "INVALID_SKILL_ATTRIBUTES"],
      [
        [item({ skill: { kind: "new", name: "Х", attributes: ["focus", "social", "strength"] } })],
        "INVALID_SKILL_ATTRIBUTES",
      ],
      [
        [item({ skill: { kind: "new", name: "Х", attributes: ["luck"] } })],
        "INVALID_SKILL_ATTRIBUTES",
      ],
      [[item({ skill: { kind: "new", name: "  ", attributes: ["focus"] } })], "INVALID_ITEMS"],
      [[item({ skill: { kind: "other" } })], "INVALID_ITEMS"],
    ];
    for (const [items, code] of cases) {
      await expect(apply(items, await newParse()), JSON.stringify(items)).rejects.toMatchObject({
        message: code,
      });
    }
    expect(await count("select count(*) from public.quests where source = 'ai_plan'")).toBe(0);
    expect(
      await count(`select count(*) from public.character_skills where character_id = '${CHAR_A}'`),
    ).toBe(2);
  });

  it("grants: anon cannot call it, internal helpers are not exposed, users read only their parses", async () => {
    await newParse(USER_B);
    const own = await asUser<{ n: number }>(
      db,
      USER_A,
      "select count(*)::int as n from public.day_plan_parses",
    );
    expect(own.rows[0]!.n).toBe(0);
    await expect(
      asUser(
        db,
        USER_A,
        "insert into public.day_plan_parses (user_id, plan_date, input_text, model, status) values ($1, $2, 't', 'm', 'ok')",
        [USER_A, DATE],
      ),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asUser(
        db,
        USER_A,
        "select * from public._resolve_event_skill($1, '{\"kind\":\"none\"}'::jsonb, 'X')",
        [CHAR_A],
      ),
    ).rejects.toThrow(/permission denied/);
    const anon = await db
      .transaction(async (tx) => {
        await tx.exec("set local role anon");
        return tx.query(
          "select public.apply_day_plan('2026-11-20', '[]'::jsonb, gen_random_uuid())",
        );
      })
      .catch((e: Error) => e);
    expect(anon).toBeInstanceOf(Error);
    expect((anon as Error).message).toMatch(/permission denied/);
  });
});

describe("apply_day_plan — plan date and the next day", () => {
  const NEXT = "2026-11-21";

  it("items go to their dates; the next day's plan is created; planned_at = scheduled_at", async () => {
    const parseId = await newParse();
    const r = await apply(
      [
        item({ title: "Вечером гитара", start_time: "20:00", duration_minutes: 30 }),
        item({ title: "Утром пробежка", start_time: "07:00", duration_minutes: 30, date: NEXT }),
        item({ title: "Купить хлеб", duration_minutes: 10, date: DATE }),
      ],
      parseId,
    );
    expect(r.quests.map((q) => [q.title, (q as { date?: string }).date])).toEqual([
      ["Вечером гитара", DATE],
      ["Купить хлеб", DATE],
      ["Утром пробежка", NEXT],
    ]);
    expect(
      await count(
        `select count(*) from public.quests q join public.daily_plans dp on dp.id = q.daily_plan_id
         where dp.date = $1 and q.title = 'Утром пробежка' and q.planned_at = q.scheduled_at`,
        [NEXT],
      ),
    ).toBe(1);
  });

  it("a date other than the plan date or the next day → INVALID_ITEMS, nothing written", async () => {
    const parseId = await newParse();
    await expect(apply([item({ date: "2026-11-23" })], parseId)).rejects.toThrow(/INVALID_ITEMS/);
    await expect(apply([item({ date: "2026-11-19" })], await newParse())).rejects.toThrow(
      /INVALID_ITEMS/,
    );
    expect(await count("select count(*) from public.daily_plans where date = '2026-11-23'")).toBe(
      0,
    );
  });

  it("the 960-minute limit is per date", async () => {
    // 900 new minutes on the next day pass (its plan is empty) even though the plan date already has 60
    const ok = await apply(
      [
        item({ duration_minutes: 480, date: NEXT }),
        item({ title: "Ещё", duration_minutes: 420, date: NEXT }),
      ],
      await newParse(),
    );
    expect(ok.success).toBe(true);
    // the next day now has 900 → +90 there fails with the date in DETAIL; the plan date is not affected
    const err = await apply([item({ duration_minutes: 90, date: NEXT })], await newParse()).catch(
      (e: Error & { detail?: string }) => e,
    );
    expect((err as Error).message).toMatch(/PLAN_HOURS_LIMIT/);
    expect(JSON.parse((err as { detail: string }).detail)).toMatchObject({
      date: NEXT,
      existingMinutes: 900,
      newMinutes: 90,
    });
    const okToday = await apply([item({ duration_minutes: 90 })], await newParse());
    expect(okToday.totalMinutes).toBe(150);
  });

  it("appending: a second parse adds to the same date (no per-date lock)", async () => {
    await apply([item({ title: "Первое" })], await newParse());
    await apply([item({ title: "Второе" })], await newParse());
    expect(
      await count(
        `select count(*) from public.quests q join public.daily_plans dp on dp.id = q.daily_plan_id
         where dp.date = $1 and q.title in ('Первое', 'Второе')`,
        [DATE],
      ),
    ).toBe(2);
  });
});
