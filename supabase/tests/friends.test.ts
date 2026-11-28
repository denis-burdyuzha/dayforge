/**
 * Friends (migration 20261129170000): friend codes, add / remove / regenerate, limits, friend cards with a safe
 * day summary, access. Seed: pglite/seed.sql (A «Альфа», B «Бета»); extra users are created per test.
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
const CHAR_B = "bbbbbbbb-0000-0000-0000-00000000000b";
const CODE_RE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/;
const CARD_KEYS = [
  "aspect",
  "attributes",
  "class",
  "level",
  "name",
  "streak",
  "summary",
  "tier",
  "title_skill",
  "today_done",
  "user_id",
].sort();

interface Card {
  user_id: string;
  name: string;
  streak: number;
  today_done: boolean;
  summary: {
    planned_count: number;
    completed_count: number;
    completed_hours: number;
    skills: string[];
  } | null;
  [k: string]: unknown;
}

let db: PGlite;
let seq = 0;

/** A new user with a character; returns the user id */
async function makeUser(withCharacter = true): Promise<string> {
  seq += 1;
  const id = `30000000-0000-4000-8000-${String(seq).padStart(12, "0")}`;
  await db.query(
    "insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, jsonb_build_object('username', $3::text))",
    [id, `u${seq}@test.local`, `user_${seq}`],
  );
  if (withCharacter) {
    await db.query(
      "insert into public.characters (profile_id, name, class) values ($1, $2, 'explorer')",
      [id, `Игрок ${seq}`],
    );
  }
  return id;
}

const codeOf = async (user: string) =>
  (
    await db.query<{ c: string }>("select friend_code as c from public.profiles where id = $1", [
      user,
    ])
  ).rows[0]!.c;

const rpc = async <T>(user: string, sql: string, params: unknown[] = []) =>
  (await asUser<{ r: T }>(db, user, `select ${sql} as r`, params)).rows[0]!.r;

const add = (user: string, code: string) =>
  rpc<{ friend_user_id: string; name: string; already_friends: boolean }>(
    user,
    "public.add_friend_by_code($1)",
    [code],
  );

const friends = (user: string) => rpc<Card[]>(user, "public.get_friends()");

beforeAll(async () => {
  db = await createTestDb();
  await db.exec(readFileSync(path.join(here, "pglite/seed.sql"), "utf8"));
}, 60_000);

describe("friend codes", () => {
  it("every profile has a unique 8-character code; new users get one", async () => {
    const a = await codeOf(USER_A);
    const b = await codeOf(USER_B);
    const c = await codeOf(await makeUser());
    for (const code of [a, b, c]) expect(code).toMatch(CODE_RE);
    expect(new Set([a, b, c]).size).toBe(3);
    expect(await rpc<{ code: string }>(USER_A, "public.get_my_friend_code()")).toEqual({
      code: a,
      share_daily_summary: true,
    });
  });
});

describe("add / remove", () => {
  it("by code (any case, spaces) → mutual at once; a repeat → already_friends", async () => {
    const codeB = await codeOf(USER_B);
    const r = await add(USER_A, `  ${codeB.toLowerCase()} `);
    expect(r).toEqual({ friend_user_id: USER_B, name: "Бета", already_friends: false });
    expect((await friends(USER_A)).map((f) => f.user_id)).toEqual([USER_B]);
    expect((await friends(USER_B)).map((f) => f.user_id)).toEqual([USER_A]);
    expect((await add(USER_A, codeB)).already_friends).toBe(true);
    expect((await add(USER_B, await codeOf(USER_A))).already_friends).toBe(true);
  });

  it("errors: own code, bad / unknown code, a user without a character", async () => {
    await expect(add(USER_A, await codeOf(USER_A))).rejects.toThrow("CANNOT_FRIEND_SELF");
    await expect(add(USER_A, "12")).rejects.toThrow("INVALID_CODE");
    await expect(add(USER_A, "")).rejects.toThrow("INVALID_CODE");
    await expect(add(USER_A, "ZZZZZZZZ")).rejects.toThrow("INVALID_CODE");
    const ghost = await makeUser(false);
    await expect(add(USER_A, await codeOf(ghost))).rejects.toThrow("INVALID_CODE");
    await expect(add(ghost, await codeOf(USER_A))).rejects.toThrow("CHARACTER_NOT_FOUND");
  });

  it("remove_friend removes for both sides", async () => {
    const x = await makeUser();
    const y = await makeUser();
    await add(x, await codeOf(y));
    expect(await rpc(y, "public.remove_friend($1)", [x])).toEqual({ removed: true });
    expect(await friends(x)).toEqual([]);
    expect(await friends(y)).toEqual([]);
    expect(await rpc(x, "public.remove_friend($1)", [y])).toEqual({ removed: false });
  });

  it("regenerate_friend_code: the old code stops working, the new one works", async () => {
    const x = await makeUser();
    const y = await makeUser();
    const old = await codeOf(x);
    const fresh = await rpc<{ code: string }>(x, "public.regenerate_friend_code()");
    expect(fresh.code).toMatch(CODE_RE);
    expect(fresh.code).not.toBe(old);
    await expect(add(y, old)).rejects.toThrow("INVALID_CODE");
    expect((await add(y, fresh.code)).already_friends).toBe(false);
  });
});

describe("limits", () => {
  it("FRIEND_LIMIT: 100 friends at either side", async () => {
    const full = await makeUser();
    for (let i = 0; i < 100; i += 1) {
      const other = await makeUser();
      await db.query(
        `insert into public.friendships (user_low, user_high, created_by, created_at)
         values (least($1::uuid, $2::uuid), greatest($1::uuid, $2::uuid), $2, now() - interval '2 days')`,
        [full, other],
      );
    }
    const newcomer = await makeUser();
    await expect(add(full, await codeOf(newcomer))).rejects.toThrow("FRIEND_LIMIT");
    await expect(add(newcomer, await codeOf(full))).rejects.toThrow("FRIEND_LIMIT");
  });

  it("RATE_LIMIT: 20 new friends per 24 hours", async () => {
    const busy = await makeUser();
    for (let i = 0; i < 20; i += 1) {
      await add(busy, await codeOf(await makeUser()));
    }
    await expect(add(busy, await codeOf(await makeUser()))).rejects.toThrow("RATE_LIMIT");
    // a repeat of an existing friend is not a new add
    const first = (await friends(busy))[0]!;
    expect((await add(busy, await codeOf(first.user_id))).already_friends).toBe(true);
  });
});

describe("friend cards", () => {
  it("only the allowed fields; a summary of the day without titles or texts", async () => {
    const today = (
      await db.query<{ d: string }>("select public._user_today($1)::text as d", [USER_B])
    ).rows[0]!.d;
    const plan = await db.query<{ id: string }>(
      "insert into public.daily_plans (character_id, date) values ($1, $2) returning id",
      [CHAR_B, today],
    );
    const pid = plan.rows[0]!.id;
    for (const [title, status, hours, skill] of [
      ["СЕКРЕТНЫЙ КВЕСТ 1", "completed", 1.5, "Английский"],
      ["СЕКРЕТНЫЙ КВЕСТ 2", "completed", 2, "Зал"],
      ["СЕКРЕТНЫЙ КВЕСТ 3", "completed", 0.5, "Чтение"],
      ["СЕКРЕТНЫЙ КВЕСТ 4", "completed", 0.25, "Бег"],
      ["СЕКРЕТНЫЙ КВЕСТ 5", "pending", null, "Музыка"],
    ] as const) {
      await db.query(
        "insert into public.quests (daily_plan_id, title, status, hours, skill_name) values ($1, $2, $3, $4, $5)",
        [pid, title, status, hours, skill],
      );
    }
    await db.query(
      "insert into public.daily_reports (character_id, date, content) values ($1, $2, 'СЕКРЕТНЫЙ ОТЧЁТ')",
      [CHAR_B, today],
    );

    const list = await friends(USER_A);
    const b = list.find((f) => f.user_id === USER_B)!;
    expect(Object.keys(b).sort()).toEqual(CARD_KEYS);
    expect(b).toMatchObject({ name: "Бета", class: "warrior", streak: 1, today_done: true });
    expect(b.summary).toMatchObject({
      planned_count: 5,
      completed_count: 4,
      completed_hours: 4.25,
      skills: ["Зал", "Английский", "Чтение"],
    });

    const profile = await rpc<Card & { days: unknown[]; week: unknown[]; longest: number }>(
      USER_A,
      "public.get_friend_profile($1)",
      [USER_B],
    );
    expect(profile.days).toHaveLength(7);
    expect(profile.week).toHaveLength(7);
    expect(profile.longest).toBe(1);

    const everything = JSON.stringify({ list, profile });
    expect(everything).not.toContain("СЕКРЕТНЫЙ");
    expect(everything).not.toContain("@test.local");
    expect(everything).not.toContain("friend_code");
  });

  it("share_daily_summary = false → summary and days are null", async () => {
    await asUser(
      db,
      USER_B,
      "update public.profiles set share_daily_summary = false where id = $1",
      [USER_B],
    );
    const b = (await friends(USER_A)).find((f) => f.user_id === USER_B)!;
    expect(b.summary).toBeNull();
    const profile = await rpc<{ days: unknown; streak: number }>(
      USER_A,
      "public.get_friend_profile($1)",
      [USER_B],
    );
    expect(profile.days).toBeNull();
    expect(profile.streak).toBe(1);
    await asUser(
      db,
      USER_B,
      "update public.profiles set share_daily_summary = true where id = $1",
      [USER_B],
    );
  });

  it("get_friends shows only my friends; a stranger's profile → NOT_FRIENDS", async () => {
    const stranger = await makeUser();
    expect(await friends(stranger)).toEqual([]);
    expect((await friends(USER_A)).map((f) => f.user_id)).not.toContain(stranger);
    await expect(rpc(stranger, "public.get_friend_profile($1)", [USER_B])).rejects.toThrow(
      "NOT_FRIENDS",
    );
    await expect(rpc(USER_A, "public.get_friend_profile($1)", [stranger])).rejects.toThrow(
      "NOT_FRIENDS",
    );
  });

  it("sorted: done today first, then by streak", async () => {
    const me = await makeUser();
    const [lazy, steady, doneToday] = [await makeUser(), await makeUser(), await makeUser()];
    for (const f of [lazy, steady, doneToday]) await add(me, await codeOf(f));
    const charOf = async (u: string) =>
      (
        await db.query<{ id: string }>("select id from public.characters where profile_id = $1", [
          u,
        ])
      ).rows[0]!.id;
    const today = (
      await db.query<{ d: string }>("select public._user_today($1)::text as d", [steady])
    ).rows[0]!.d;
    // steady: yesterday and the 2 days before (streak 3, today not done); doneToday: today only (streak 1)
    for (const back of [1, 2, 3]) {
      await db.query(
        "insert into public.daily_reports (character_id, date, content) values ($1, $2::date - $3::int, 'x')",
        [await charOf(steady), today, back],
      );
    }
    await db.query(
      "insert into public.daily_reports (character_id, date, content) values ($1, $2, 'x')",
      [await charOf(doneToday), today],
    );
    expect((await friends(me)).map((f) => f.user_id)).toEqual([doneToday, steady, lazy]);
  });
});

describe("access", () => {
  it("the client cannot write friendships or friend codes directly", async () => {
    await expect(
      asUser(
        db,
        USER_A,
        "insert into public.friendships (user_low, user_high, created_by) values ($1, $2, $1)",
        [USER_A, USER_B],
      ),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asUser(db, USER_A, "delete from public.friendships where user_low = $1", [USER_A]),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asUser(db, USER_A, "update public.profiles set friend_code = 'AAAAAAAA' where id = $1", [
        USER_A,
      ]),
    ).rejects.toThrow(/permission denied/);
  });

  it("RLS: a user reads only their own friendships; anon reads nothing", async () => {
    const rows = await asUser<{ user_low: string; user_high: string }>(
      db,
      USER_B,
      "select user_low, user_high from public.friendships",
    );
    for (const r of rows.rows) expect([r.user_low, r.user_high]).toContain(USER_B);
    await expect(asAnon(db, "select * from public.friendships")).rejects.toThrow(
      /permission denied/,
    );
  });

  it("anon cannot call the RPCs; internal helpers are closed to clients", async () => {
    for (const sql of [
      "select public.get_friends()",
      "select public.get_my_friend_code()",
      "select public.add_friend_by_code('ABCDEFGH')",
      "select public.regenerate_friend_code()",
    ]) {
      await expect(asAnon(db, sql)).rejects.toThrow(/permission denied/);
    }
    for (const sql of [
      `select public._friend_card('${USER_B}')`,
      `select public._day_summary('${CHAR_B}', current_date)`,
      "select public._new_friend_code()",
      `select public._are_friends('${USER_A}', '${USER_B}')`,
    ]) {
      await expect(asUser(db, USER_A, sql)).rejects.toThrow(/permission denied/);
    }
  });

  it("the read RPCs work in a read-only transaction (PostgREST runs STABLE functions read-only)", async () => {
    const r = await db.transaction(async (tx) => {
      await tx.exec(
        `set transaction read only; set local role authenticated;
         select set_config('request.jwt.claim.sub', '${USER_A}', true);`,
      );
      const list = await tx.query<{ r: Card[] }>("select public.get_friends() as r");
      const prof = await tx.query<{ r: Card }>("select public.get_friend_profile($1) as r", [
        USER_B,
      ]);
      const code = await tx.query<{ r: { code: string } }>(
        "select public.get_my_friend_code() as r",
      );
      return { list: list.rows[0]!.r, prof: prof.rows[0]!.r, code: code.rows[0]!.r };
    });
    expect(r.list.length).toBeGreaterThan(0);
    expect(r.prof.user_id).toBe(USER_B);
    expect(r.code.code).toMatch(CODE_RE);
  });
});
