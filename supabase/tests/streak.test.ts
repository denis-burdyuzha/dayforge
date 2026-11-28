/**
 * Daily streak with a weekly freeze (migration 20261129160000): _user_today, _streak_info, get_my_streak,
 * apply_day_report → daily_reports, character_snapshots.streak. Seed: pglite/seed.sql.
 *
 * Fixed clock: 2026-11-26 12:00 UTC = Thursday; the week is Mon 23 – Sun 29 November.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { asAnon, asUser, createTestDb } from "./pglite/db";

const here = path.dirname(fileURLToPath(import.meta.url));
const USER_A = "11111111-1111-1111-1111-111111111111";
const CHAR_A = "aaaaaaaa-0000-0000-0000-00000000000a";
const NOW = "2026-11-26 12:00:00+00";

interface Streak {
  current: number;
  longest: number;
  frozen_dates: string[];
  today_done: boolean;
  broken_recently: boolean;
  broken_on: string | null;
  today: string;
  week: { date: string; status: string }[];
}

let db: PGlite;

/** Replaces A's reports with the given dates */
async function reports(dates: string[]) {
  await db.query("delete from public.daily_reports where character_id = $1", [CHAR_A]);
  for (const d of dates) {
    await db.query(
      "insert into public.daily_reports (character_id, date, content) values ($1, $2, 'x')",
      [CHAR_A, d],
    );
  }
}

/** Dates from..to inclusive, except the listed ones */
function range(from: string, to: string, except: string[] = []): string[] {
  const out: string[] = [];
  for (
    let d = new Date(`${from}T00:00:00Z`);
    d <= new Date(`${to}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    const s = d.toISOString().slice(0, 10);
    if (!except.includes(s)) out.push(s);
  }
  return out;
}

async function streak(now = NOW): Promise<Streak> {
  const r = await db.query<{ s: Streak }>("select public._streak_info($1, $2) as s", [CHAR_A, now]);
  return r.rows[0]!.s;
}

async function setProfile(timezone: string | null, dayStart = "04:00") {
  await db.query("update public.profiles set timezone = $2, day_start_time = $3 where id = $1", [
    USER_A,
    timezone,
    dayStart,
  ]);
}

beforeAll(async () => {
  db = await createTestDb();
  await db.exec(readFileSync(path.join(here, "pglite/seed.sql"), "utf8"));
}, 60_000);

beforeEach(async () => {
  await setProfile(null);
});

describe("streak", () => {
  it("5 days in a row → 5 (today done)", async () => {
    await reports(range("2026-11-22", "2026-11-26"));
    const s = await streak();
    expect(s).toMatchObject({
      current: 5,
      longest: 5,
      today_done: true,
      frozen_dates: [],
      today: "2026-11-26",
    });
  });

  it("today not done → counted up to yesterday", async () => {
    await reports(range("2026-11-23", "2026-11-25"));
    const s = await streak();
    expect(s).toMatchObject({ current: 3, today_done: false, broken_recently: false });
    expect(s.week.map((d) => d.status)).toEqual([
      "done",
      "done",
      "done",
      "today",
      "future",
      "future",
      "future",
    ]);
  });

  it("one missed day in a week is frozen: the streak goes on, the day gives +0", async () => {
    await reports(range("2026-11-20", "2026-11-26", ["2026-11-24"]));
    const s = await streak();
    expect(s.current).toBe(6);
    expect(s.frozen_dates).toEqual(["2026-11-24"]);
    expect(s.week.find((d) => d.date === "2026-11-24")?.status).toBe("frozen");
  });

  it("yesterday missed, today not done yet → yesterday is frozen", async () => {
    await reports(range("2026-11-21", "2026-11-24"));
    const s = await streak();
    expect(s).toMatchObject({ current: 4, frozen_dates: ["2026-11-25"], today_done: false });
  });

  it("two missed days in one week → the streak breaks (+ «welcome back»)", async () => {
    await reports([...range("2026-11-20", "2026-11-23"), "2026-11-26"]);
    const s = await streak();
    expect(s).toMatchObject({
      current: 1,
      longest: 4,
      frozen_dates: [],
      broken_recently: true,
      broken_on: "2026-11-25",
    });
    expect(s.week.map((d) => d.status)).toEqual([
      "done",
      "missed",
      "missed",
      "done",
      "future",
      "future",
      "future",
    ]);
  });

  it("missed days in different weeks are both frozen", async () => {
    await reports(range("2026-11-12", "2026-11-26", ["2026-11-18", "2026-11-24"]));
    const s = await streak();
    expect(s.current).toBe(13);
    expect(s.frozen_dates).toEqual(["2026-11-18", "2026-11-24"]);
  });

  it("longest: the best run in the window, the current one is separate", async () => {
    // Wed 11 frozen, Thu 12 is the second miss of that week → break
    await reports([...range("2026-11-01", "2026-11-10"), ...range("2026-11-20", "2026-11-25")]);
    const s = await streak();
    expect(s).toMatchObject({ current: 6, longest: 10, broken_recently: false });
  });

  it("a short run before the break is not «broken recently»; an old break neither", async () => {
    await reports([...range("2026-11-22", "2026-11-23"), "2026-11-26"]);
    expect((await streak()).broken_recently).toBe(false);
    await reports(range("2026-11-10", "2026-11-15"));
    expect(await streak()).toMatchObject({ current: 0, broken_recently: false });
  });

  it("no reports → zeros", async () => {
    await reports([]);
    expect(await streak()).toMatchObject({
      current: 0,
      longest: 0,
      today_done: false,
      frozen_dates: [],
    });
  });
});

describe("the user's date: day_start_time + timezone", () => {
  it("Europe/Chisinau (UTC+2), boundary 04:00", async () => {
    await setProfile("Europe/Chisinau");
    await reports(range("2026-11-23", "2026-11-25"));
    // 01:30 UTC = 03:30 local → still 25 November
    expect(await streak("2026-11-26 01:30:00+00")).toMatchObject({
      today: "2026-11-25",
      today_done: true,
      current: 3,
    });
    // 02:30 UTC = 04:30 local → 26 November, not done yet
    expect(await streak("2026-11-26 02:30:00+00")).toMatchObject({
      today: "2026-11-26",
      today_done: false,
      current: 3,
    });
  });

  it("timezone null or unknown → UTC", async () => {
    const today = async (now: string) =>
      (await db.query<{ d: string }>("select public._user_today($1, $2)::text as d", [USER_A, now]))
        .rows[0]?.d;
    await setProfile(null);
    expect(await today("2026-11-26 03:59:00+00")).toBe("2026-11-25");
    expect(await today("2026-11-26 04:00:00+00")).toBe("2026-11-26");
    await setProfile("Mars/Phobos");
    expect(await today("2026-11-26 04:00:00+00")).toBe("2026-11-26");
    await setProfile("Europe/Chisinau", "00:00");
    expect(await today("2026-11-25 22:30:00+00")).toBe("2026-11-26");
  });
});

describe("get_my_streak + writers", () => {
  it("RPC: the caller's own streak; anon and internal helpers are closed", async () => {
    await reports([]);
    // PostgREST runs STABLE RPCs read-only — the function must not lock rows
    const ro = await db.transaction(async (tx) => {
      await tx.exec(
        `set transaction read only; set local role authenticated;
         select set_config('request.jwt.claim.sub', '${USER_A}', true);`,
      );
      return tx.query<{ s: Streak }>("select public.get_my_streak() as s");
    });
    expect(ro.rows[0]?.s.current).toBe(0);
    const r = await asUser<{ s: Streak }>(db, USER_A, "select public.get_my_streak() as s");
    expect(r.rows[0]?.s).toMatchObject({ current: 0, today_done: false });
    await expect(asAnon(db, "select public.get_my_streak()")).rejects.toThrow(/permission denied/);
    await expect(asUser(db, USER_A, "select public._streak_info($1)", [CHAR_A])).rejects.toThrow(
      /permission denied/,
    );
    await expect(asUser(db, USER_A, "select public._user_today($1)", [USER_A])).rejects.toThrow(
      /permission denied/,
    );
  });

  it("apply_day_report leaves a daily_reports row with the report text; the snapshot carries the streak", async () => {
    const today = (
      await db.query<{ d: string }>("select public._user_today($1)::text as d", [USER_A])
    ).rows[0]!.d;
    await reports([]);
    const skill = await asUser<{ r: { id: string } }>(
      db,
      USER_A,
      "select public.create_skill($1, $2) as r",
      ["Бег", ["endurance"]],
    );
    await db.query(
      `insert into public.day_report_parses (id, user_id, report_date, input_text, model, status)
       values ('a6000000-0000-0000-0000-000000000001', $1, $2, 'Бегал час', 'm', 'ok')`,
      [USER_A, today],
    );
    await asUser(db, USER_A, "select public.apply_day_report($1, $2, $3)", [
      today,
      JSON.stringify([
        {
          description: "Пробежка",
          hours: 1,
          skill: { kind: "existing", skill_id: skill.rows[0]!.r.id },
        },
      ]),
      "a6000000-0000-0000-0000-000000000001",
    ]);
    const rep = await db.query<{ content: string }>(
      "select content from public.daily_reports where character_id = $1 and date = $2",
      [CHAR_A, today],
    );
    expect(rep.rows).toEqual([{ content: "Бегал час" }]);

    const snap = await db.query<{ streak: number }>(
      "select streak from public.character_snapshots where character_id = $1 and snapshot_date = $2",
      [CHAR_A, today],
    );
    expect(snap.rows[0]?.streak).toBe(1);

    // save_daily_report after the apply still works (overwrites the text)
    await asUser(db, USER_A, "select public.save_daily_report($1, $2)", [today, "Итог дня"]);
    const rep2 = await db.query<{ content: string }>(
      "select content from public.daily_reports where character_id = $1 and date = $2",
      [CHAR_A, today],
    );
    expect(rep2.rows[0]?.content).toBe("Итог дня");
  });
});
