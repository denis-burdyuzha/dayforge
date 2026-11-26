/**
 * Test database: PGlite (Postgres in WASM) + a stub of the Supabase `auth` schema + every migration in
 * supabase/migrations, applied in file-name order. No Docker needed.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { uuid_ossp } from "@electric-sql/pglite/contrib/uuid_ossp";

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(here, "../../migrations");
const BOM = String.fromCharCode(0xfeff);

export async function createTestDb(): Promise<PGlite> {
  const db = new PGlite({ extensions: { pgcrypto, uuid_ossp } });
  await db.exec(readFileSync(path.join(here, "bootstrap.sql"), "utf8"));
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    try {
      // strip a UTF-8 BOM (some migrations have one; the Supabase CLI tolerates it)
      const sql = readFileSync(path.join(migrationsDir, file), "utf8");
      await db.exec(sql.startsWith(BOM) ? sql.slice(1) : sql);
    } catch (err) {
      throw new Error(`migration ${file} failed: ${(err as Error).message}`, { cause: err });
    }
  }
  return db;
}

/** Run `sql` as the given user (role `authenticated`, auth.uid() = userId) inside one transaction */
export async function asUser<T>(db: PGlite, userId: string, sql: string, params: unknown[] = []) {
  return db.transaction(async (tx) => {
    await tx.exec(
      `set local role authenticated; select set_config('request.jwt.claim.sub', '${userId}', true);`,
    );
    return tx.query<T>(sql, params);
  });
}
