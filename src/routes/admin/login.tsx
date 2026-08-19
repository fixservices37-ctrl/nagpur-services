import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Wrench } from "lucide-react";
import { useEffect, useState } from "react";

import { useAdminAuth } from "@/components/admin/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { business } from "@/lib/business";

export const Route = createFileRoute("/admin/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    // Only same-site paths are accepted, so the redirect cannot be used to
    // bounce a signed-in owner to an external site.
    redirect:
      typeof search["redirect"] === "string" && /^\/admin(\/|$)/.test(search["redirect"])
        ? search["redirect"]
        : "/admin",
  }),
  head: () => ({
    meta: [{ title: "Admin Sign In" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const { session, loading, signIn } = useAdminAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      // `redirect` is validated above to be an /admin path; the cast satisfies
      // the router's literal route type.
      void navigate({ to: redirect as "/admin", replace: true });
    }
  }, [loading, session, navigate, redirect]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    // `redirect` is validated above to be an /admin path; the cast satisfies
    // the router's literal route type.
    void navigate({ to: redirect as "/admin", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wrench className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold">{business.name}</span>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
        >
          <div className="text-center">
            <h1 className="text-xl">Admin sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              For the business owner and staff only.
            </p>
          </div>

          <div>
            <Label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : <Lock />}
            {submitting ? "Signing in…" : "Sign in"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Accounts are created by the business owner in Supabase. There is no public sign-up.
          </p>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
