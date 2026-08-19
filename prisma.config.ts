import { config as loadDotenv } from "dotenv";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI configuration.
 *
 * The database password belongs in .env.local (git-ignored), not in .env
 * (which is committed and syncs back to Lovable). Copy the two connection
 * strings from Supabase → Project Settings → Database → Connection string.
 *
 *   DATABASE_URL — Transaction pooler (port 6543), used by the runtime client
 *   DIRECT_URL   — Direct connection  (port 5432), used by `prisma migrate` /
 *                  `prisma db pull`. `migrate` refuses to run through pgBouncer.
 *
 * Prisma 7 auto-loads .env / .env.local, but we re-load them explicitly so
 * the same config file works from `tsx` for the admin scripts too.
 */
loadDotenv({ path: ".env.local" });
loadDotenv({ path: ".env" });

// `||` (not `??`) so an accidentally-blank value falls through to the fallback.
const url = process.env["DIRECT_URL"] || process.env["DATABASE_URL"] || "";

// Commands that connect to Postgres need a URL; offline commands (`generate`,
// `validate`, `format`) don't. Warn once so the URL-less workflows keep working
// while `migrate` / `db pull` / `studio` get a helpful pointer.
const CONNECT_COMMANDS = ["migrate", "db", "studio", "seed"];
const needsConnection = process.argv.some((arg) => CONNECT_COMMANDS.includes(arg));

if (!url && needsConnection) {
  console.error(
    [
      "",
      "Prisma cannot connect: neither DATABASE_URL nor DIRECT_URL is set.",
      "",
      "Create .env.local in the project root (it is git-ignored) with:",
      "",
      '  DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres"',
      '  DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"',
      "",
      "Get both strings from Supabase → Project Settings → Database → Connection string.",
      "",
    ].join("\n"),
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url },
});
