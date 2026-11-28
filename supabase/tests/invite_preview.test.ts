/**
 * Invite preview (migration 20261129180000): anon gets only { name, class } of the code's owner, or null.
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
let codeB = "";

const preview = async (code: string, user?: string) => {
  const sql = "select public.get_invite_preview($1) as r";
  const res = user
    ? await asUser<{ r: unknown }>(db, user, sql, [code])
    : await asAnon<{ r: unknown }>(db, sql, [code]);
  return res.rows[0]?.r;
};

beforeAll(async () => {
  db = await createTestDb();
  await db.exec(readFileSync(path.join(here, "pglite/seed.sql"), "utf8"));
  codeB = (
    await db.query<{ c: string }>("select friend_code as c from public.profiles where id = $1", [
      USER_B,
    ])
  ).rows[0]!.c;
}, 60_000);

describe("get_invite_preview", () => {
  it("anon: only the name and the class (any case, spaces)", async () => {
    expect(await preview(codeB)).toEqual({ name: "Бета", class: "warrior" });
    expect(await preview(` ${codeB.toLowerCase()} `)).toEqual({ name: "Бета", class: "warrior" });
  });

  it("signed in works the same", async () => {
    expect(await preview(codeB, USER_A)).toEqual({ name: "Бета", class: "warrior" });
  });

  it("bad / unknown code, or no character → null", async () => {
    expect(await preview("")).toBeNull();
    expect(await preview("abc")).toBeNull();
    expect(await preview("ZZZZZZZZ")).toBeNull();
    await db.query(
      "insert into auth.users (id, email, raw_user_meta_data) values ('33333333-3333-3333-3333-333333333333', 'c@test.local', '{\"username\":\"user_c\"}')",
    );
    const codeC = (
      await db.query<{ c: string }>(
        "select friend_code as c from public.profiles where id = '33333333-3333-3333-3333-333333333333'",
      )
    ).rows[0]!.c;
    expect(await preview(codeC)).toBeNull();
  });

  it("anon still can't use the other friends functions", async () => {
    await expect(asAnon(db, "select public.add_friend_by_code($1)", [codeB])).rejects.toThrow(
      /permission denied/,
    );
  });
});
