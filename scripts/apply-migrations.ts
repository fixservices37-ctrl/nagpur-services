/**
 * Applies every SQL file in supabase/migrations/ to the database whose
 * connection string is in DATABASE_URL (or DIRECT_URL). Tracks what has
 * already been applied in a small internal table so it is safe to re-run.
 *
 *   npm run db:apply
 */
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";

const MIGRATIONS_DIR = join(fileURLToPath(new URL("../supabase/migrations", import.meta.url)));

async function main() {
  const url = process.env["DATABASE_URL"] || process.env["DIRECT_URL"];
  if (!url) {
    throw new Error(
      "Set DATABASE_URL (or DIRECT_URL) in .env.local — Supabase → Project Settings → Database → Connection string.",
    );
  }

  const client = new pg.Client({ connectionString: url });
  await client.connect();

  try {
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS _repo;
      CREATE TABLE IF NOT EXISTS _repo.migrations (
        name       text        PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((name) => name.endsWith(".sql"))
      .sort();

    const applied = new Set(
      (await client.query<{ name: string }>("SELECT name FROM _repo.migrations")).rows.map(
        (row) => row.name,
      ),
    );

    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  ⏩ skipped (already applied): ${file}`);
        continue;
      }
      const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
      console.log(`  ▶  applying ${file}…`);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO _repo.migrations (name) VALUES ($1)", [basename(file)]);
        await client.query("COMMIT");
        ran += 1;
        console.log(`  ✅ applied ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(
          `Migration failed at ${file}:\n${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    if (ran === 0) {
      console.log("\nNothing to do — the database is already up to date.\n");
    } else {
      console.log(`\n✅ Applied ${ran} migration${ran === 1 ? "" : "s"}.\n`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(`\n❌ ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
