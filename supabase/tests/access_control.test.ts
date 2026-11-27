/**
 * Access control (migration 20261128120000_lock_game_data): the client (roles authenticated / anon) only reads game
 * data; writes go through SECURITY DEFINER RPCs that check auth.uid() and ownership. Seed: pglite/seed.sql
 * (user A: plan 2026-11-20 with pending «Пробежка» and completed «Чтение»; user B: pending «Гаммы»).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

import { asAnon, asUser, createTestDb } from "./pglite/db";

const here = path.dirname(fileURLToPath(import.meta.url));
const USER_A = "11111111-1111-1111-1111-111111111111";
const USER_B = "22222222-2222-2222-2222-222222222222";
const CHAR_A = "aaaaaaaa-0000-0000-0000-00000000000a";
const SKILL_RUN = "5a000000-0000-0000-0000-000000000002";
const SKILL_EN = "5a000000-0000-0000-0000-000000000001";
const SKILL_B_GUITAR = "5b000000-0000-0000-0000-000000000001";
const QUEST_RUN = "90000000-0000-0000-0000-000000000001";
const QUEST_DONE = "90000000-0000-0000-0000-000000000002";
const QUEST_B = "90000000-0000-0000-0000-00000000000b";

interface QuestRow {
  id: string;
  daily_plan_id: string;
  title: string;
  status: string;
  start_time: string | null;
  duration_minutes: number | null;
  hours: number | null;
  skill_id: string | null;
  skill_name: string | null;
  source: string;
  planned_at: string;
  scheduled_at: string;
}

let db: PGlite;

const rpcA = async <T>(sql: string, params: unknown[] = []) =>
  (await asUser<{ r: T }>(db, USER_A, `select ${sql} as r`, params)).rows[0]?.r as T;

const pause = () => new Promise((r) => setTimeout(r, 5)); // now() differs between transactions

beforeAll(async () => {
  db = await createTestDb();
  await db.exec(readFileSync(path.join(here, "pglite/seed.sql"), "utf8"));
}, 60_000);

describe("direct writes of game tables are rejected", () => {
  const denied = /permission denied/;
  const cases: Array<[string, string, unknown[]]> = [
    ["characters update", "update public.characters set level = 99, total_xp = 99999", []],
    [
      "characters insert",
      "insert into public.characters (profile_id, name, class) values ($1, 'x', 'warrior')",
      [USER_A],
    ],
    ["characters delete", "delete from public.characters", []],
    ["character_attributes update", "update public.character_attributes set value = 50", []],
    ["character_attributes delete", "delete from public.character_attributes", []],
    ["character_skills update", "update public.character_skills set total_xp = 9999", []],
    [
      "character_skills insert",
      "insert into public.character_skills (character_id, name) values ($1, 'Взлом')",
      [CHAR_A],
    ],
    ["character_skills delete", "delete from public.character_skills", []],
    [
      "quests update status",
      `update public.quests set status = 'completed' where id = '${QUEST_RUN}'`,
      [],
    ],
    [
      "quests insert",
      "insert into public.quests (daily_plan_id, title) values ('d0000000-0000-0000-0000-00000000000a', 'x')",
      [],
    ],
    ["quests delete", `delete from public.quests where id = '${QUEST_DONE}'`, []],
    ["character_snapshots update", "update public.character_snapshots set total_xp = 1", []],
    [
      "character_snapshots insert",
      "insert into public.character_snapshots (character_id, snapshot_date, level, tier, total_xp, attributes) values ($1, '2026-12-01', 99, 5, 0, '{}')",
      [CHAR_A],
    ],
    [
      "daily_plans insert",
      "insert into public.daily_plans (character_id, date) values ($1, '2026-12-01')",
      [CHAR_A],
    ],
    [
      "daily_reports insert",
      "insert into public.daily_reports (character_id, date, content) values ($1, '2026-12-01', 'x')",
      [CHAR_A],
    ],
    [
      "xp_transactions insert",
      "insert into public.xp_transactions (character_id, amount) values ($1, 1000)",
      [CHAR_A],
    ],
    [
      "day_report_parses insert",
      "insert into public.day_report_parses (user_id, report_date, input_text, model, status) values ($1, '2026-12-01', 't', 'm', 'ok')",
      [USER_A],
    ],
    ["truncate characters", "truncate public.characters cascade", []],
  ];
  it.each(cases)("authenticated: %s", async (_name, sql, params) => {
    await expect(asUser(db, USER_A, sql, params)).rejects.toThrow(denied);
  });

  it("the own rows stay readable", async () => {
    const res = await asUser<{ level: number }>(db, USER_A, "select level from public.characters");
    expect(res.rows).toEqual([{ level: 1 }]);
    const quests = await asUser<{ n: number }>(
      db,
      USER_A,
      "select count(*)::int as n from public.quests",
    );
    expect(quests.rows[0]?.n).toBe(2); // only A's quests
  });

  it("anon: reference tables readable, everything else denied", async () => {
    const attrs = await asAnon<{ n: number }>(
      db,
      "select count(*)::int as n from public.attribute_definitions",
    );
    expect(attrs.rows[0]?.n).toBeGreaterThanOrEqual(0); // grant present (rows are filtered by RLS)
    await asAnon(db, "select count(*) from public.skills");
    for (const t of [
      "characters",
      "profiles",
      "quests",
      "character_skills",
      "character_snapshots",
    ]) {
      await expect(asAnon(db, `select * from public.${t}`), t).rejects.toThrow(/permission denied/);
    }
    await expect(asAnon(db, "update public.characters set level = 99")).rejects.toThrow(
      /permission denied/,
    );
    await expect(asAnon(db, "select public.complete_quest($1)", [QUEST_RUN])).rejects.toThrow(
      /permission denied/,
    );
  });

  it("a new table is read-only for the client by default", async () => {
    await db.exec(
      "create table public.acl_probe (id int); insert into public.acl_probe values (1);",
    );
    const read = await asUser<{ id: number }>(db, USER_A, "select id from public.acl_probe");
    expect(read.rows).toEqual([{ id: 1 }]);
    await expect(asUser(db, USER_A, "insert into public.acl_probe values (2)")).rejects.toThrow(
      /permission denied/,
    );
    await expect(asAnon(db, "select id from public.acl_probe")).rejects.toThrow(
      /permission denied/,
    );
    await db.exec("drop table public.acl_probe;");
  });

  it("internal functions are not callable; test_quest_engine is gone", async () => {
    for (const sql of [
      `select public.calculate_quest_effects('${SKILL_RUN}', 1)`,
      "select public._normalize_skill_name('x')",
      `select public._ensure_daily_plan('${CHAR_A}', '2026-12-01')`,
      `select public._upsert_character_snapshot('${CHAR_A}', '2026-12-01')`,
    ]) {
      await expect(asUser(db, USER_A, sql), sql).rejects.toThrow(/permission denied/);
    }
    const fn = await db.query<{ n: number }>(
      "select count(*)::int as n from pg_proc where proname = 'test_quest_engine'",
    );
    expect(fn.rows[0]?.n).toBe(0);
  });
});

describe("profiles: only display fields", () => {
  it("display_name and avatar_url can be updated; username / onboarding_completed cannot", async () => {
    await asUser(
      db,
      USER_A,
      "update public.profiles set display_name = 'Альфа', avatar_url = 'a.png'",
    );
    const p = await db.query<{ display_name: string }>(
      `select display_name from public.profiles where id = '${USER_A}'`,
    );
    expect(p.rows[0]?.display_name).toBe("Альфа");
    await expect(
      asUser(db, USER_A, "update public.profiles set username = 'hacker'"),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asUser(db, USER_A, "update public.profiles set onboarding_completed = false"),
    ).rejects.toThrow(/permission denied/);
  });

  it("another user's profile is not changed", async () => {
    await asUser(db, USER_A, "update public.profiles set display_name = 'чужое' where id = $1", [
      USER_B,
    ]);
    const p = await db.query<{ display_name: string | null }>(
      `select display_name from public.profiles where id = '${USER_B}'`,
    );
    expect(p.rows[0]?.display_name).not.toBe("чужое");
  });
});

describe("quest RPCs", () => {
  it("create_quest: pending manual quest, hours from duration, planned_at = scheduled_at, plan created", async () => {
    const q = await rpcA<QuestRow>("public.create_quest($1, $2, $3, $4, $5)", [
      "2026-12-02",
      "  Пробежка вечером ",
      "19:00",
      45,
      SKILL_RUN,
    ]);
    expect(q).toMatchObject({
      title: "Пробежка вечером",
      status: "pending",
      start_time: "19:00:00",
      duration_minutes: 45,
      hours: 0.75,
      skill_id: SKILL_RUN,
      skill_name: "Бег",
      source: "manual",
    });
    expect(q.planned_at).toBe(q.scheduled_at);
    const plan = await db.query<{ date: string }>(
      `select to_char(date, 'YYYY-MM-DD') as date from public.daily_plans where id = '${q.daily_plan_id}'`,
    );
    expect(plan.rows[0]?.date).toBe("2026-12-02");
  });

  it("create_quest: validation and ownership", async () => {
    await expect(rpcA("public.create_quest($1, $2)", ["2026-12-02", "  "])).rejects.toThrow(
      /INVALID_TITLE/,
    );
    await expect(
      rpcA("public.create_quest($1, $2, null, $3)", ["2026-12-02", "x", 600]),
    ).rejects.toThrow(/INVALID_DURATION/);
    await expect(
      rpcA("public.create_quest($1, $2, null, 30, $3)", ["2026-12-02", "x", SKILL_B_GUITAR]),
    ).rejects.toThrow(/SKILL_NOT_FOUND/);
  });

  it("update_quest / delete_quest of another user's quest → QUEST_NOT_FOUND", async () => {
    await expect(rpcA("public.update_quest($1, 'x', '2026-11-20')", [QUEST_B])).rejects.toThrow(
      /QUEST_NOT_FOUND/,
    );
    await expect(rpcA("public.delete_quest($1)", [QUEST_B])).rejects.toThrow(/QUEST_NOT_FOUND/);
    const b = await db.query<{ title: string }>(
      `select title from public.quests where id = '${QUEST_B}'`,
    );
    expect(b.rows[0]?.title).toBe("Гаммы");
  });

  it("update_quest: planned_at never changes; scheduled_at moves only on a new date or start time", async () => {
    const q = await rpcA<QuestRow>("public.create_quest($1, $2, $3, $4, $5)", [
      "2026-12-03",
      "Урок",
      "10:00",
      60,
      SKILL_EN,
    ]);
    const upd = (
      title: string,
      date: string,
      start: string | null,
      dur: number | null,
      skill: string | null,
    ) =>
      rpcA<QuestRow>("public.update_quest($1, $2, $3, $4, $5, $6)", [
        q.id,
        title,
        date,
        start,
        dur,
        skill,
      ]);

    await pause();
    const renamed = await upd("Урок английского", "2026-12-03", "10:00", 60, SKILL_EN);
    await pause();
    const longer = await upd("Урок английского", "2026-12-03", "10:00", 90, SKILL_EN);
    await pause();
    const otherSkill = await upd("Урок английского", "2026-12-03", "10:00", 90, SKILL_RUN);
    for (const r of [renamed, longer, otherSkill]) {
      expect(r.planned_at).toBe(q.planned_at);
      expect(r.scheduled_at).toBe(q.scheduled_at);
    }
    expect(longer.hours).toBe(1.5);
    expect(otherSkill.skill_name).toBe("Бег");

    await pause();
    const retimed = await upd("Урок английского", "2026-12-03", "11:00", 90, SKILL_RUN);
    expect(retimed.planned_at).toBe(q.planned_at);
    expect(retimed.scheduled_at).not.toBe(q.scheduled_at);

    await pause();
    const moved = await upd("Урок английского", "2026-12-05", "11:00", 90, SKILL_RUN);
    expect(moved.planned_at).toBe(q.planned_at);
    expect(moved.scheduled_at).not.toBe(retimed.scheduled_at);
    expect(moved.daily_plan_id).not.toBe(q.daily_plan_id);
    const plan = await db.query<{ date: string }>(
      `select to_char(date, 'YYYY-MM-DD') as date from public.daily_plans where id = '${moved.daily_plan_id}'`,
    );
    expect(plan.rows[0]?.date).toBe("2026-12-05");
  });

  it("a completed quest: only the title may change; it cannot be deleted", async () => {
    // seed «Чтение»: completed, 2026-11-20, no time / duration / skill
    const renamed = await rpcA<QuestRow>("public.update_quest($1, $2, $3)", [
      QUEST_DONE,
      "Чтение книги",
      "2026-11-20",
    ]);
    expect(renamed.title).toBe("Чтение книги");
    await expect(
      rpcA("public.update_quest($1, $2, $3)", [QUEST_DONE, "Чтение книги", "2026-11-21"]),
    ).rejects.toThrow(/QUEST_COMPLETED/);
    await expect(
      rpcA("public.update_quest($1, $2, $3, null, 30)", [QUEST_DONE, "Чтение книги", "2026-11-20"]),
    ).rejects.toThrow(/QUEST_COMPLETED/);
    await expect(rpcA("public.delete_quest($1)", [QUEST_DONE])).rejects.toThrow(/QUEST_COMPLETED/);
  });

  it("delete_quest removes a pending quest", async () => {
    const q = await rpcA<QuestRow>("public.create_quest($1, $2)", ["2026-12-04", "Удалить меня"]);
    await rpcA("public.delete_quest($1)", [q.id]);
    const n = await db.query<{ n: number }>(
      `select count(*)::int as n from public.quests where id = '${q.id}'`,
    );
    expect(n.rows[0]?.n).toBe(0);
  });
});

describe("create_skill, get_or_create_daily_plan, save_daily_report", () => {
  it("create_skill: 1–2 attributes required; dedup by name and alias", async () => {
    await expect(rpcA("public.create_skill($1, $2)", ["Шахматы", []])).rejects.toThrow(
      /INVALID_ATTRIBUTES/,
    );
    await expect(
      rpcA("public.create_skill($1, $2)", ["Шахматы", ["intelligence", "focus", "discipline"]]),
    ).rejects.toThrow(/INVALID_ATTRIBUTES/);
    await expect(rpcA("public.create_skill($1, $2)", ["Шахматы", ["luck"]])).rejects.toThrow(
      /INVALID_ATTRIBUTES/,
    );

    const created = await rpcA<{ id: string; created: boolean }>("public.create_skill($1, $2)", [
      "Шахматы",
      ["intelligence", "focus"],
    ]);
    expect(created.created).toBe(true);
    const again = await rpcA<{ id: string; created: boolean }>("public.create_skill($1, $2)", [
      "  шахматы ",
      ["strength"],
    ]);
    expect(again).toMatchObject({ id: created.id, created: false });
    // seed.sql does not set aliases (apply_day_report.sql does) — add one here
    await db.query(
      `update public.character_skills set aliases = '{англ}' where id = '${SKILL_EN}'`,
    );
    const alias = await rpcA<{ id: string; created: boolean }>("public.create_skill($1, $2)", [
      "англ",
      ["focus"],
    ]);
    expect(alias).toMatchObject({ id: SKILL_EN, created: false });

    const row = await db.query<{ p: string; s: string }>(
      `select (select code from attribute_definitions where id = primary_attribute_id) as p,
              (select code from attribute_definitions where id = secondary_attribute_id) as s
       from public.character_skills where id = '${created.id}'`,
    );
    expect(row.rows[0]).toEqual({ p: "intelligence", s: "focus" });
  });

  it("get_or_create_daily_plan is idempotent per date", async () => {
    const a = await rpcA<{ id: string; date: string }>("public.get_or_create_daily_plan($1)", [
      "2026-12-10",
    ]);
    const b = await rpcA<{ id: string }>("public.get_or_create_daily_plan($1)", ["2026-12-10"]);
    expect(b.id).toBe(a.id);
    expect(a.date).toBe("2026-12-10");
  });

  it("save_daily_report upserts the caller's report", async () => {
    const first = await rpcA<{ id: string; content: string }>("public.save_daily_report($1, $2)", [
      "2026-11-20",
      "Первый текст",
    ]);
    const second = await rpcA<{ id: string; content: string }>("public.save_daily_report($1, $2)", [
      "2026-11-20",
      "Второй текст",
    ]);
    expect(second.id).toBe(first.id);
    expect(second.content).toBe("Второй текст");
    await expect(rpcA("public.save_daily_report($1, $2)", ["2026-11-20", "   "])).rejects.toThrow(
      /INVALID_CONTENT/,
    );
  });
});
