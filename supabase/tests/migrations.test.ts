import { describe, expect, it } from "vitest";

import { createTestDb } from "./pglite/db";

describe("migrations", () => {
  it("all migrations apply on a clean database", async () => {
    const db = await createTestDb();
    const res = await db.query<{ n: number }>(
      "select count(*)::int as n from pg_proc where proname in ('complete_quest', 'calculate_quest_effects')",
    );
    expect(res.rows[0]?.n).toBe(2);
  }, 60_000);
});
