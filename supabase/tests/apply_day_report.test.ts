/** Runs supabase/tests/apply_day_report.sql (checks raise on failure) on PGlite with all migrations. */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { createTestDb } from "./pglite/db";

const here = path.dirname(fileURLToPath(import.meta.url));

describe("apply_day_report (SQL checks)", () => {
  it("idempotency, 16h day limit, skill dedup by alias, foreign data, grants", async () => {
    const db = await createTestDb();
    await db.exec(readFileSync(path.join(here, "pglite/seed.sql"), "utf8"));
    await expect(
      db.exec(readFileSync(path.join(here, "apply_day_report.sql"), "utf8")),
    ).resolves.toBeDefined();
  }, 60_000);
});
