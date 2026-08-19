import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// .env.local first: it is git-ignored, which is where the database password
// belongs (.env is committed and only holds public Supabase keys).
config({ path: [".env.local", ".env"] });

/**
 * Prisma CLI configuration (Prisma 7 keeps connection URLs out of schema.prisma).
 *
 * DIRECT_URL is the direct Postgres connection (port 5432) from
 * Supabase → Project Settings → Database → Connection string. Introspection and
 * migrations need the direct connection, not the pooled one.
 *
 * The URL is read leniently so that offline commands (`prisma validate`,
 * `prisma generate`, `prisma format`) keep working on a machine that has no
 * database credentials — only the commands that actually connect will fail.
 */
const directUrl = process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"] ?? "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: directUrl,
  },
});
