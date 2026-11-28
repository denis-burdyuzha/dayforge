/**
 * Character name (migration 20261129150000): rules, banned roots with normalisation, rename_character,
 * complete_onboarding. Seed: pglite/seed.sql (user A «Альфа», user B «Бета»).
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

let db: PGlite;

const rename = (name: string, user = USER_A) =>
  asUser<{ r: { name: string } }>(db, user, "select public.rename_character($1) as r", [name]);

const nameOf = async (user: string) =>
  (
    await db.query<{ name: string }>("select name from public.characters where profile_id = $1", [
      user,
    ])
  ).rows[0]?.name;

beforeAll(async () => {
  db = await createTestDb();
  await db.exec(readFileSync(path.join(here, "pglite/seed.sql"), "utf8"));
}, 60_000);

describe("character name rules", () => {
  it("valid names: any alphabet, digits, space, dash, underscore; trimmed", async () => {
    for (const name of [
      "Ли",
      "Странник-42",
      "Ёжик_в_тумане",
      "Αλέξης",
      "Jane Doe",
      "Æsir",
      "李小龍",
    ]) {
      const res = await rename(`  ${name} `);
      expect(res.rows[0]?.r.name, name).toBe(name);
    }
    expect(await nameOf(USER_A)).toBe("李小龍");
  });

  it("invalid: length, symbols, double spaces → INVALID_NAME", async () => {
    for (const name of [
      "Я",
      "",
      "   ",
      "a".repeat(21),
      "Имя!",
      "Имя@мэйл",
      "Два  пробела",
      "эмодзи🔥",
      "a.b",
    ]) {
      await expect(rename(name), JSON.stringify(name)).rejects.toThrow(/INVALID_NAME/);
    }
  });

  it("banned roots → NAME_NOT_ALLOWED, also with ё, Latin look-alikes and separators", async () => {
    for (const name of [
      "Сука",
      "суКа 3000",
      "Cyka",
      "С-у-к-а",
      "Блядина",
      "Ёбарь Ебатов",
      "FuckBoy",
      "sh1t",
      "xyй",
    ]) {
      // «sh1t»: 1 is not a look-alike — it must NOT be caught (no digit-to-letter guessing beyond 0/3)
      if (name === "sh1t") {
        await expect(rename(name)).resolves.toBeTruthy();
        continue;
      }
      await expect(rename(name), name).rejects.toThrow(/NAME_NOT_ALLOWED/);
    }
  });

  it("ordinary names with a short root inside stay allowed", async () => {
    for (const name of ["Лохматый", "Командарм", "Cassandra", "Peacock", "Хлеб"]) {
      await expect(rename(name), name).resolves.toBeTruthy();
    }
  });

  it("rename changes only the caller's character; anon cannot call it", async () => {
    await rename("Альфа");
    await asUser(db, USER_B, "select public.rename_character($1)", ["Бета2"]);
    expect(await nameOf(USER_A)).toBe("Альфа");
    expect(await nameOf(USER_B)).toBe("Бета2");
    await expect(asAnon(db, "select public.rename_character('X1')")).rejects.toThrow(
      /permission denied/,
    );
  });

  it("clients cannot read banned_words; internal functions are not callable", async () => {
    await expect(asUser(db, USER_A, "select * from public.banned_words")).rejects.toThrow(
      /permission denied/,
    );
    await expect(asUser(db, USER_A, "select public._check_character_name('Имя')")).rejects.toThrow(
      /permission denied/,
    );
    const n = await db.query<{ n: number }>("select count(*)::int as n from public.banned_words");
    expect(n.rows[0]?.n).toBeGreaterThanOrEqual(40);
  });

  it("complete_onboarding checks the name before writing anything", async () => {
    const USER_C = "33333333-3333-3333-3333-333333333333";
    await db.query(
      `insert into auth.users (id, email, raw_user_meta_data) values ($1, 'c@t.local', '{}')`,
      [USER_C],
    );
    const onboard = (name: string) =>
      asUser(db, USER_C, "select public.complete_onboarding($1, $2, 'warrior', '{}') as r", [
        "user_c",
        name,
      ]);
    await expect(onboard("Сучка")).rejects.toThrow(/NAME_NOT_ALLOWED/);
    await expect(onboard("!")).rejects.toThrow(/INVALID_NAME/);
    const none = await db.query<{ n: number }>(
      "select count(*)::int as n from public.characters where profile_id = $1",
      [USER_C],
    );
    expect(none.rows[0]?.n).toBe(0);
    await onboard("  Гамма ");
    expect(await nameOf(USER_C)).toBe("Гамма");
  });
});
