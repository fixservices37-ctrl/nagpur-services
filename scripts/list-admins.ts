/**
 * Lists the accounts that can sign in to /admin.
 *
 *   npm run admin:list
 *
 * Requires DATABASE_URL (or DIRECT_URL) in .env.
 */
import { disconnectPrisma, prisma } from "../src/integrations/prisma/client.server";

async function main() {
  const roles = await prisma.userRole.findMany({
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  if (roles.length === 0) {
    console.log("\nNo admin accounts yet. Create one with:\n");
    console.log("  npm run admin:create -- --email owner@example.com\n");
    return;
  }

  console.log("\nAdmin panel accounts");
  console.log("──────────────────────────────────────────────");
  for (const entry of roles) {
    const lastSignIn = entry.user.lastSignInAt
      ? entry.user.lastSignInAt.toISOString().replace("T", " ").slice(0, 16)
      : "never";
    console.log(
      `  ${entry.user.email ?? "(no email)"}  [${entry.role}]  last sign-in: ${lastSignIn}`,
    );
  }
  console.log("──────────────────────────────────────────────\n");
}

main()
  .catch((error: unknown) => {
    console.error(`\n❌ ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  })
  .finally(() => {
    void disconnectPrisma();
  });
