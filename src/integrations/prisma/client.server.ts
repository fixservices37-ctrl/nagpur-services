// Server-only Prisma client.
//
// SECURITY: this connects to Postgres as the database owner and therefore
// BYPASSES Row Level Security. It must never be imported from a route file,
// a component, or anything else that ends up in the browser or edge bundle —
// only from other *.server.ts modules and Node scripts. Visitor-facing data
// access goes through supabase-js, where RLS applies.
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

function createPrismaClient() {
  const connectionString = process.env["DATABASE_URL"] ?? process.env["DIRECT_URL"];

  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL. Copy the Supabase connection string into .env — see .env.example.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env["NODE_ENV"] === "production" ? ["error"] : ["warn", "error"],
  });
}

// Reuse one client across hot reloads so dev does not exhaust the connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Created on first use, so importing this module never throws on a machine
// without database credentials — the error surfaces where it can be handled.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    globalForPrisma.prisma ??= createPrismaClient();
    return Reflect.get(globalForPrisma.prisma, property, receiver);
  },
});

/** Closes the pool if one was ever opened. Safe to call unconditionally. */
export async function disconnectPrisma() {
  await globalForPrisma.prisma?.$disconnect();
}
