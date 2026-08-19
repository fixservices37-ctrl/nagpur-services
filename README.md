# Nagpur Home Care

Website and admin panel for a small home-maintenance business in Nagpur, Maharashtra
(electrical, plumbing, carpentry and RO / water-filter services).

The public site is a fast, mostly-static marketing site whose one dynamic feature is a
service-request form. The admin panel is a private area where the owner reads those
requests, calls the customer, and tracks the job to completion.

```
Customer → website → request form → Supabase
                                      ↓
                         Admin panel (/admin) → owner calls customer
                                              → assigns a technician
                                              → updates the status
```

## Stack

| Layer     | Choice                                                                   |
| --------- | ------------------------------------------------------------------------ |
| Framework | React 19 + TypeScript on TanStack Start (SSR) with Vite                   |
| Styling   | Tailwind CSS v4 + shadcn/ui components                                    |
| App data  | Supabase (Postgres + Auth + Storage) via supabase-js — RLS enforced       |
| Tooling   | Prisma 7 — typed schema + Node-side admin scripts (bypasses RLS)          |
| Hosting   | Nitro build, Cloudflare target (`.output/`)                               |

### Why two data layers

`supabase-js` is what the website and admin panel use at runtime. Every query goes
through PostgREST, so **Row Level Security decides what each visitor can see** — that is
the protection around customer phone numbers and addresses.

Prisma connects straight to Postgres as the database owner and therefore **bypasses RLS**.
It is deliberately kept out of the request path and used only from Node: admin
provisioning scripts, data fixes, reporting, and as a typed model of the schema. Anything
under `src/integrations/prisma/` may only be imported by `*.server.ts` modules and by
files in `scripts/`.

## Local development

```sh
npm install            # also runs `prisma generate`
cp .env.example .env   # fill in your Supabase values
npm run dev            # http://localhost:8080
```

| Script                 | Purpose                                                     |
| ---------------------- | ----------------------------------------------------------- |
| `npm run dev`          | Dev server                                                   |
| `npm run build`        | Production build into `.output/`                             |
| `npm run preview`      | Serve the production build                                   |
| `npm run typecheck`    | `tsc --noEmit`                                               |
| `npm run lint`         | ESLint + Prettier                                            |
| `npm run db:generate`  | Regenerate the Prisma client into `src/generated/prisma`     |
| `npm run db:pull`      | Re-introspect the live database into `prisma/schema.prisma`  |
| `npm run db:studio`    | Prisma Studio — browse/edit the database in a GUI            |
| `npm run admin:create` | Create or update an admin-panel account                      |
| `npm run admin:list`   | List accounts that can sign in to `/admin`                   |

The Prisma client is generated code and is git-ignored; `npm install` regenerates it, or
run `npm run db:generate` by hand.

## Environment variables

See `.env.example`. `VITE_*` variables are inlined into the browser bundle — never put a
secret behind a `VITE_` prefix.

| Variable                        | Purpose                                            |
| ------------------------------- | -------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Supabase project URL                                |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public anon/publishable key (safe in the browser)   |
| `VITE_SITE_URL`                 | Canonical origin, used for canonical tags & og:url  |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` | Same values, read during SSR            |

Prisma needs the database password, which must **not** go in the committed `.env`. Put it
in `.env.local` (git-ignored via `*.local`):

```sh
# .env.local — never commit
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
```

Both strings come from Supabase → Project Settings → Database → Connection string
(`DATABASE_URL` = Transaction pooler / 6543, `DIRECT_URL` = direct / 5432).

## Database

Migrations live in `supabase/migrations/` and run in filename order. Apply them with the
Supabase CLI (`supabase db push`) or by pasting each file into the SQL editor of the
Supabase dashboard.

| Migration                      | Contents                                                     |
| ------------------------------ | ------------------------------------------------------------ |
| `..._service_requests`         | `service_requests` table, insert-only RLS for the public form |
| `..._storage_policy`           | Anonymous upload policy for customer photos                   |
| `..._submit_service_request`   | `submit_service_request()` RPC with server-side validation    |
| `20260816120000_admin_panel`   | Roles, admin RLS, workflow fields, storage hardening          |

Security model:

- Anonymous visitors may **only insert** a request (through the validated RPC) and upload
  photos. They cannot read anything back — not their own request, not anyone else's.
- Reading and updating requests requires a signed-in user who has a row in `user_roles`.
- The photo bucket is private, capped at 5 MB per file and restricted to image MIME types
  at the storage layer; admins view photos through short-lived signed URLs.
- A database trigger makes the customer-submitted fields immutable — the admin panel can
  only change `status`, `assigned_to` and `admin_notes`.

## Admin panel

Live at `/admin` (and linked discreetly as “Staff login” in the footer). It is excluded
from `robots.txt`, sends `noindex, nofollow`, and is never server-rendered with data.

| Route                  | Purpose                                                                 |
| ---------------------- | ------------------------------------------------------------------------ |
| `/admin/login`         | Email + password sign-in (no public sign-up)                             |
| `/admin`               | Dashboard: new / open / today / completed counters + latest requests     |
| `/admin/requests`      | Full list with search, status & service filters, date range, CSV export  |
| `/admin/requests/$id`  | One request: customer, problem, address, map, photos, status & notes     |

Every row has one-tap **Call** and **WhatsApp** actions, which is how the owner actually
works the queue from a phone.

### Creating an admin account

Apply the `20260816120000_admin_panel` migration first, then either:

**With the script** (needs `DATABASE_URL` in `.env.local`):

```sh
npm run admin:create -- --email owner@example.com
# ...or choose the password yourself, and the role:
npm run admin:create -- --email staff@example.com --password 'a-strong-password' --role staff
```

It creates the Supabase Auth user (email confirmed, bcrypt password, matching identity
row), grants the role, and prints the credentials once. Re-running it for an existing
email resets that account's password. `npm run admin:list` shows who has access.

**Or through the dashboard**, if you'd rather not hand the database password to a script:

1. Supabase → **Authentication → Users → Add user**, with “Auto Confirm User” ticked.
2. SQL editor:

   ```sql
   INSERT INTO public.user_roles (user_id, role)
   SELECT id, 'admin' FROM auth.users WHERE email = 'owner@example.com'
   ON CONFLICT DO NOTHING;
   ```

Either way, sign in at `/admin/login`. Use `staff` instead of `admin` for an account that
should read and update requests but not delete them or manage other users' roles.

A signed-in account with no role sees a clear “no admin access” message rather than data.

## Going live — checklist

1. **Business details.** `src/lib/business.ts` still holds placeholder name, phone,
   WhatsApp number, email and address. Every call/WhatsApp button on the site reads from
   that one file — replace those values before launch.
2. **Reviews.** `placeholderReviews` in `src/lib/services.ts` is clearly-labelled sample
   text. Replace it with real customer feedback, or remove the section.
3. **Domain.** Set `VITE_SITE_URL` to the live origin, then update the domain in
   `public/sitemap.xml` and the `Sitemap:` line in `public/robots.txt`.
4. **Database.** Apply all migrations to the production project and create the admin
   account as described above.
5. **Admin password.** Use a strong, unique password; consider enabling MFA in Supabase
   Auth.
6. **Verify.** `npm run typecheck && npm run build`, then submit a test request and work
   it through the admin panel end to end.
7. **Search Console.** Submit `sitemap.xml` and verify the property.

`public/_headers` sets security headers (`X-Content-Type-Options`, `Referrer-Policy`,
`X-Frame-Options`, `Permissions-Policy`, HSTS) plus `no-store` for `/admin/*`. It is read
by Cloudflare Pages / Netlify; on another host, port those headers to its own config.

## Project layout

```
src/
  routes/            file-based routes — one file per URL
    admin/           admin panel (route.tsx provides the auth context)
  components/
    site/            public site components (header, footer, request form…)
    admin/           auth context, data hooks, admin shell
    ui/              shadcn/ui primitives
  integrations/
    supabase/        runtime data access (RLS enforced)
    prisma/          server-only client (bypasses RLS — Node scripts only)
  generated/prisma/  generated Prisma client (git-ignored)
  lib/
    business.ts      ← all business contact details live here
    services.ts      services, areas, FAQs, reviews content
    admin.ts         request statuses, formatting, CSV export
    seo.ts           canonical/OG tags and LocalBusiness structured data
prisma/schema.prisma typed model of the database (refresh with npm run db:pull)
prisma.config.ts     Prisma CLI config — connection URLs live here, not in the schema
scripts/             Node-side admin tooling (create-admin, list-admins)
supabase/migrations/ database schema and policies — source of truth
```

## Not built (deliberately)

Customer accounts, worker logins, online payments, live tracking, bidding, commissions and
multi-city support are intentionally out of scope. The business runs on phone calls; the
site exists to earn trust and collect requests, and the admin panel exists to work them.

---

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nagpur-home-care.lovable.app ·
[Lovable editor](https://lovable.dev/projects/1e63d432-1f29-4352-9a67-1e5b856e3adf)

Commits pushed to `main` sync back into Lovable, so keep the branch in a working state and
avoid rewriting published history.
#   n a g p u r - s e r v i c e s  
 