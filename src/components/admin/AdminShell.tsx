import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ClipboardList,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  ShieldAlert,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { useAdminAuth } from "@/components/admin/auth";
import { Button } from "@/components/ui/button";
import { business } from "@/lib/business";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/requests", label: "Service Requests", icon: ClipboardList, exact: false },
] as const;

/**
 * Guards every admin page and renders the admin chrome.
 *
 * The session lives in localStorage, so the server render never knows who the
 * user is — pages render a neutral loading state until the client resolves it.
 */
export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string | undefined;
  actions?: ReactNode | undefined;
  children: ReactNode;
}) {
  const { session, loading, isStaff, email, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      void navigate({ to: "/admin/login", search: { redirect: pathname }, replace: true });
    }
  }, [loading, session, navigate, pathname]);

  if (loading || !session) {
    return <AdminSplash />;
  }

  if (!isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </span>
          <h1 className="mt-4 text-xl">No admin access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You are signed in as {email}, but this account has not been given access to the admin
            panel. Ask the owner to grant your account a role.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => void signOut()}>
            <LogOut /> Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex w-full max-w-[100rem]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
          <BrandBlock />
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
          </nav>
          <AccountBlock email={email} onSignOut={() => void signOut()} />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur lg:hidden">
            <div className="flex h-14 items-center justify-between px-4">
              <Link to="/admin" className="flex items-center gap-2 font-display font-bold">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Wrench className="h-4 w-4" />
                </span>
                Admin
              </Link>
              <button
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
            {menuOpen && (
              <div className="border-t border-border p-3">
                <nav className="space-y-1" onClick={() => setMenuOpen(false)}>
                  {navItems.map((item) => (
                    <NavLink key={item.to} {...item} />
                  ))}
                </nav>
                <AccountBlock email={email} onSignOut={() => void signOut()} />
              </div>
            )}
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl">{title}</h1>
                {description && (
                  <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

function BrandBlock() {
  return (
    <div className="border-b border-border px-5 py-4">
      <Link to="/admin" className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wrench className="h-5 w-5" />
        </span>
        <span className="leading-tight">
          <span className="block font-display text-sm font-bold">Admin Panel</span>
          <span className="block text-[11px] text-muted-foreground">{business.name}</span>
        </span>
      </Link>
    </div>
  );
}

type AdminNavItem = (typeof navItems)[number];

function NavLink({
  to,
  label,
  icon: Icon,
  exact,
}: {
  to: AdminNavItem["to"];
  label: string;
  icon: typeof LayoutDashboard;
  exact: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      activeProps={{ className: "bg-secondary text-primary" }}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function AccountBlock({ email, onSignOut }: { email: string | null; onSignOut: () => void }) {
  return (
    <div className="border-t border-border p-3">
      <p className="truncate px-2 pb-2 text-xs text-muted-foreground" title={email ?? undefined}>
        {email}
      </p>
      <Button variant="outline" size="sm" className="w-full" onClick={onSignOut}>
        <LogOut /> Sign out
      </Button>
      <Link
        to="/"
        className="mt-2 block px-2 text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        View public website
      </Link>
    </div>
  );
}
