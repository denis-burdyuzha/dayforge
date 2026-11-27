/**
 * quest_counts_for_league (migration 20261129130000): «planned in advance» by scheduled_at in the owner's time zone.
 * Times are explicit timestamptz literals (PGlite has no clock override). Seed: pglite/seed.sql (user A, plan
 * 2026-11-20). User A lives in Europe/Chisinau (UTC+2 in November).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { asUser, createTestDb } from "./pglite/db";

const here = path.dirname(fileURLToPath(import.meta.url));
const USER_A = "11111111-1111-1111-1111-111111111111";
const CHAR_A = "aaaaaaaa-0000-0000-0000-00000000000a";
const DATE = "2026-11-27";

let db: PGlite;
let seq = 0;

/** a quest of user A on `date` with `startTime` (or none), scheduled at `scheduledAt` (timestamptz literal) */
async function quest(startTime: string | null, scheduledAt: string, date = DATE): Promise<string> {
  seq += 1;
  const id = `e0000000-0000-0000-0000-${String(seq).padStart(12, "0")}`;
  await db.query(
    `insert into public.daily_plans (character_id, date) values ($1, $2) on conflict (character_id, date) do nothing`,
    [CHAR_A, date],
  );
  await db.query(
    `insert into public.quests (id, daily_plan_id, title, start_time, scheduled_at, planned_at)
     select $1, dp.id, 'q', $2::time, $3::timestamptz, $3::timestamptz
     from public.daily_plans dp where dp.character_id = $4 and dp.date = $5`,
    [id, startTime, scheduledAt, CHAR_A, date],
  );
  return id;
}

const counts = async (id: string) =>
  (await db.query<{ r: boolean }>("select public.quest_counts_for_league($1) as r", [id])).rows[0]
    ?.r;

const setProfile = (timezone: string | null, dayStart = "04:00") =>
  db.query(`update public.profiles set timezone = $1, day_start_time = $2 where id = $3`, [
    timezone,
    dayStart,
    USER_A,
  ]);

beforeAll(async () => {
  db = await createTestDb();
  await db.exec(readFileSync(path.join(here, "pglite/seed.sql"), "utf8"));
}, 60_000);

beforeEach(async () => {
  await setProfile("Europe/Chisinau");
});

describe("quest_counts_for_league", () => {
  it("moved from another date to today 10 minutes before the start → false", async () => {
    // start 10:00 local; rescheduled (update_quest moves scheduled_at) at 09:50 local
    expect(await counts(await quest("10:00", `${DATE} 09:50:00+02`))).toBe(false);
  });

  it("shifted in the morning by 30 minutes, starting in 5 hours → true", async () => {
    // was 13:00, moved to 13:30 at 08:30 local
    expect(await counts(await quest("13:30", `${DATE} 08:30:00+02`))).toBe(true);
  });

  it("exactly one hour before → true; less than an hour → false", async () => {
    expect(await counts(await quest("10:00", `${DATE} 09:00:00+02`))).toBe(true);
    expect(await counts(await quest("10:00", `${DATE} 09:01:00+02`))).toBe(false);
  });

  it("no start time: added at 15:00 → false; the evening before → true; by 14:00 → true", async () => {
    expect(await counts(await quest(null, `${DATE} 15:00:00+02`))).toBe(false);
    expect(await counts(await quest(null, `2026-11-26 21:00:00+02`))).toBe(true);
    expect(await counts(await quest(null, `${DATE} 14:00:00+02`))).toBe(true);
  });

  it("before the start of the user's day (boundary) → true even if within the hour", async () => {
    // start 02:30, scheduled 02:00 local: the hour rule fails, but 02:00 is before the 04:00 day start
    const id = await quest("02:30", `${DATE} 02:00:00+02`);
    expect(await counts(id)).toBe(true);
    // with a 00:00 boundary the day already started at 02:00 → only the hour rule → false
    await setProfile("Europe/Chisinau", "00:00");
    expect(await counts(id)).toBe(false);
  });

  it("time zone: NULL or unknown → UTC", async () => {
    // start 10:00; scheduled 08:30Z. In Chisinau 10:00 local = 08:00Z → too late; in UTC 10:00Z − 1h = 09:00Z → ok
    const id = await quest("10:00", `${DATE} 08:30:00Z`);
    expect(await counts(id)).toBe(false);
    await setProfile(null);
    expect(await counts(id)).toBe(true);
    await setProfile("Not/AZone");
    expect(await counts(id)).toBe(true);
  });

  it("an unknown quest → false; clients cannot call it", async () => {
    expect(await counts("e0000000-0000-0000-0000-999999999999")).toBe(false);
    const id = await quest("10:00", `${DATE} 06:00:00+02`);
    await expect(
      asUser(db, USER_A, "select public.quest_counts_for_league($1)", [id]),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("apply_day_plan timestamps", () => {
  it("quests created by the AI plan get planned_at = scheduled_at", async () => {
    await db.query(
      `insert into public.day_plan_parses (id, user_id, plan_date, input_text, model, status)
       values ('c9000000-0000-0000-0000-000000000001', $1, '2026-12-01', 't', 'm', 'ok')`,
      [USER_A],
    );
    const res = await asUser<{ r: { quests: Array<{ id: string }> } }>(
      db,
      USER_A,
      "select public.apply_day_plan($1, $2, $3) as r",
      [
        "2026-12-01",
        JSON.stringify([
          { title: "Дело", start_time: "10:00", duration_minutes: 30, skill: { kind: "none" } },
        ]),
        "c9000000-0000-0000-0000-000000000001",
      ],
    );
    const id = res.rows[0]?.r.quests[0]?.id;
    const row = await db.query<{ same: boolean }>(
      "select planned_at = scheduled_at as same from public.quests where id = $1",
      [id],
    );
    expect(row.rows[0]?.same).toBe(true);
  });
});
