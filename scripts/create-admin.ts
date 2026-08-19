/**
 * Creates (or updates) an admin account for the /admin panel.
 *
 *   npm run admin:create -- --email owner@example.com
 *   npm run admin:create -- --email staff@example.com --password 'chosen-password' --role staff
 *
 * With no --password a strong one is generated and printed once.
 *
 * Requires DATABASE_URL (or DIRECT_URL) in .env — Supabase → Project Settings →
 * Database → Connection string. The script talks to Postgres through Prisma, so
 * it bypasses RLS; run it from a trusted machine only.
 */
import { randomBytes, randomInt } from "node:crypto";

import { disconnectPrisma, prisma } from "../src/integrations/prisma/client.server";

type Role = "admin" | "staff";

interface Args {
  email: string;
  password: string;
  role: Role;
  generated: boolean;
}

function parseArgs(argv: string[]): Args {
  const values = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg?.startsWith("--")) continue;
    const [flag, inline] = arg.slice(2).split("=", 2);
    if (!flag) continue;
    values.set(flag, inline ?? argv[i + 1] ?? "");
    if (inline === undefined) i += 1;
  }

  const email = (values.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Pass a valid address: --email owner@example.com");
  }

  const role = (values.get("role") ?? "admin").trim() as Role;
  if (role !== "admin" && role !== "staff") {
    throw new Error("--role must be 'admin' or 'staff'");
  }

  const provided = values.get("password");
  if (provided && provided.length < 12) {
    throw new Error("--password must be at least 12 characters");
  }

  return {
    email,
    password: provided || generatePassword(),
    role,
    generated: !provided,
  };
}

/** Readable but high-entropy: ~95 bits over a 62-character alphabet. */
function generatePassword(length = 16) {
  const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let password = "";
  while (password.length < length) {
    password += alphabet[randomInt(alphabet.length)];
  }
  return `${password}-${randomBytes(2).toString("hex")}`;
}

async function main() {
  const { email, password, role, generated } = parseArgs(process.argv.slice(2));

  // pgcrypto lives in the `extensions` schema on Supabase; bcrypt via crypt()
  // is the hash format GoTrue expects in auth.users.encrypted_password.
  const [existing] = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id::text FROM auth.users WHERE lower(email) = ${email}
  `;

  let userId: string;
  let created: boolean;

  if (existing) {
    userId = existing.id;
    created = false;
    await prisma.$executeRaw`
      UPDATE auth.users
      SET encrypted_password = extensions.crypt(${password}, extensions.gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          updated_at = now()
      WHERE id = ${existing.id}::uuid
    `;
  } else {
    const [inserted] = await prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        ${email},
        extensions.crypt(${password}, extensions.gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        now(),
        now()
      )
      RETURNING id::text
    `;

    if (!inserted) throw new Error("Could not create the auth user.");
    userId = inserted.id;
    created = true;

    // GoTrue needs a matching identity row for email/password sign-in.
    await prisma.$executeRaw`
      INSERT INTO auth.identities (
        id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        ${userId}::uuid,
        ${userId},
        jsonb_build_object('sub', ${userId}, 'email', ${email}, 'email_verified', true, 'phone_verified', false),
        'email',
        now(), now(), now()
      )
      ON CONFLICT DO NOTHING
    `;
  }

  await prisma.userRole.upsert({
    where: { userId_role: { userId, role } },
    update: {},
    create: { userId, role },
  });

  console.log("");
  console.log(created ? "✅ Admin account created" : "✅ Existing account updated");
  console.log("──────────────────────────────────────────────");
  console.log(`  URL       http://localhost:8080/admin/login  (and /admin/login in production)`);
  console.log(`  Email     ${email}`);
  console.log(`  Password  ${generated ? password : "(the password you passed in)"}`);
  console.log(`  Role      ${role}`);
  console.log("──────────────────────────────────────────────");
  if (generated) {
    console.log("Save this password now — it is hashed in the database and cannot be read back.");
  }
  console.log("");
}

main()
  .catch((error: unknown) => {
    console.error(`\n❌ ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  })
  .finally(() => {
    void disconnectPrisma();
  });
