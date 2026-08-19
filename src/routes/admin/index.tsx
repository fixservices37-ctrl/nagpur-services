import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Inbox,
  Loader2,
  MessageCircle,
  Phone,
  RefreshCw,
} from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminAuth } from "@/components/admin/auth";
import { useRecentRequests, useRequestStats } from "@/components/admin/queries";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_REQUEST_SEARCH,
  relativeTime,
  telHrefFor,
  whatsappHrefFor,
  type RequestListSearch,
} from "@/lib/admin";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Dashboard — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { isStaff } = useAdminAuth();
  const stats = useRequestStats(isStaff);
  const recent = useRecentRequests(isStaff);

  const refreshing = stats.isFetching || recent.isFetching;

  return (
    <AdminShell
      title="Dashboard"
      description="Service requests submitted from the website."
      actions={
        <Button
          variant="outline"
          onClick={() => {
            void stats.refetch();
            void recent.refetch();
          }}
          disabled={refreshing}
        >
          {refreshing ? <Loader2 className="animate-spin" /> : <RefreshCw />} Refresh
        </Button>
      }
    >
      {stats.isError && <ErrorNote message="Could not load the dashboard counters." />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="New requests"
          value={stats.data?.new}
          hint="Waiting for your first call"
          icon={Inbox}
          tone="accent"
          search={{ ...DEFAULT_REQUEST_SEARCH, status: "New" }}
        />
        <StatCard
          label="Open"
          value={stats.data?.open}
          hint="Not yet completed or cancelled"
          icon={CalendarClock}
          tone="primary"
          search={DEFAULT_REQUEST_SEARCH}
        />
        <StatCard
          label="Today"
          value={stats.data?.today}
          hint="Submitted today"
          icon={CalendarClock}
          tone="primary"
        />
        <StatCard
          label="Completed"
          value={stats.data?.completed}
          hint="All time"
          icon={CheckCircle2}
          tone="whatsapp"
          search={{ ...DEFAULT_REQUEST_SEARCH, status: "Completed" }}
        />
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <h2 className="text-lg">Latest requests</h2>
          <Button variant="link" className="px-0" asChild>
            <Link to="/admin/requests" search={DEFAULT_REQUEST_SEARCH}>
              View all <ArrowRight />
            </Link>
          </Button>
        </div>

        {recent.isPending ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading requests…</div>
        ) : recent.isError ? (
          <div className="p-5">
            <ErrorNote message="Could not load the latest requests." />
          </div>
        ) : recent.data?.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No service requests yet. They appear here as soon as a customer submits the form.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.data?.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to="/admin/requests/$id"
                      params={{ id: request.id }}
                      className="font-semibold text-foreground underline-offset-4 hover:underline"
                    >
                      {request.request_number}
                    </Link>
                    <StatusBadge status={request.status} />
                    <span className="text-xs text-muted-foreground">
                      {relativeTime(request.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-foreground">
                    {request.full_name} · {request.service}
                    {request.area ? ` · ${request.area}` : ""}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {request.problem_description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={telHrefFor(request.mobile)} aria-label={`Call ${request.full_name}`}>
                      <Phone /> Call
                    </a>
                  </Button>
                  <Button size="sm" variant="whatsapp" asChild>
                    <a
                      href={whatsappHrefFor(
                        request.mobile,
                        `Hello ${request.full_name}, regarding your service request ${request.request_number}.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp ${request.full_name}`}
                    >
                      <MessageCircle /> WhatsApp
                    </a>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}

const toneStyles = {
  accent: "bg-accent/20 text-accent-foreground",
  primary: "bg-primary/10 text-primary",
  whatsapp: "bg-whatsapp/15 text-whatsapp",
} as const;

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  search,
}: {
  label: string;
  value: number | undefined;
  hint: string;
  icon: typeof Inbox;
  tone: keyof typeof toneStyles;
  /** When given, the tile links to the request list with these filters. */
  search?: RequestListSearch | undefined;
}) {
  const body = (
    <div className="flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-[var(--shadow-card)]">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneStyles[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-display text-2xl font-bold text-foreground">
          {value ?? <span className="text-muted-foreground">—</span>}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );

  if (!search) return body;

  return (
    <Link to="/admin/requests" search={search} className="block h-full">
      {body}
    </Link>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
      {message} Please refresh, and check that your account still has admin access.
    </p>
  );
}
