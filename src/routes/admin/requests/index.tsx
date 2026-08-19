import { Link, createFileRoute, stripSearchParams, useNavigate } from "@tanstack/react-router";
import { Download, Loader2, MessageCircle, Phone, RefreshCw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminAuth } from "@/components/admin/auth";
import {
  fetchRequestsForExport,
  useRequests,
  type RequestFilters,
} from "@/components/admin/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_REQUEST_SEARCH,
  REQUEST_STATUSES,
  downloadCsv,
  formatDateTime,
  telHrefFor,
  toCsv,
  whatsappHrefFor,
  type RequestListSearch,
} from "@/lib/admin";
import { services } from "@/lib/services";

const PAGE_SIZE = 20;

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export const Route = createFileRoute("/admin/requests/")({
  validateSearch: (search: Record<string, unknown>): RequestListSearch => ({
    status: asString(search["status"], DEFAULT_REQUEST_SEARCH.status),
    service: asString(search["service"], DEFAULT_REQUEST_SEARCH.service),
    q: asString(search["q"]).slice(0, 80),
    from: asString(search["from"]),
    to: asString(search["to"]),
    page: Math.max(1, Number(search["page"]) || 1),
  }),
  // Keep default filters out of the URL so shared links stay readable.
  search: { middlewares: [stripSearchParams(DEFAULT_REQUEST_SEARCH)] },
  head: () => ({
    meta: [{ title: "Service Requests — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: RequestsPage,
});

function RequestsPage() {
  const { isStaff } = useAdminAuth();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const [searchText, setSearchText] = useState(search.q);
  const [exporting, setExporting] = useState(false);

  // Keep the input in sync when the URL changes from outside (back button, links).
  useEffect(() => setSearchText(search.q), [search.q]);

  const filters: RequestFilters = {
    status: search.status,
    service: search.service,
    search: search.q,
    from: search.from,
    to: search.to,
    page: search.page,
    pageSize: PAGE_SIZE,
  };

  const query = useRequests(filters, isStaff);
  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function setSearch(patch: Partial<RequestListSearch>) {
    void navigate({
      search: (previous) => ({ ...previous, ...patch, page: patch.page ?? 1 }),
      replace: true,
    });
  }

  const filtersApplied =
    search.status !== "all" ||
    search.service !== "all" ||
    !!search.q ||
    !!search.from ||
    !!search.to;

  async function onExport() {
    setExporting(true);
    try {
      const rows = await fetchRequestsForExport(filters);
      const stamp = new Date().toISOString().slice(0, 10);
      downloadCsv(`service-requests-${stamp}.csv`, toCsv(rows));
    } catch {
      window.alert("Could not export the requests. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <AdminShell
      title="Service Requests"
      description="Every request submitted from the website. Call the customer to confirm, then update the status."
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
          >
            {query.isFetching ? <Loader2 className="animate-spin" /> : <RefreshCw />} Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => void onExport()}
            disabled={exporting || total === 0}
          >
            {exporting ? <Loader2 className="animate-spin" /> : <Download />} Export CSV
          </Button>
        </>
      }
    >
      <form
        className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch({ q: searchText.trim() });
        }}
      >
        <div className="sm:col-span-2">
          <Label htmlFor="q" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Search
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="q"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Name, mobile, request no., area"
              className="pl-9"
            />
          </div>
        </div>

        <SelectField
          id="status"
          label="Status"
          value={search.status}
          onChange={(value) => setSearch({ status: value })}
          options={[
            { value: "all", label: "All statuses" },
            ...REQUEST_STATUSES.map((status) => ({ value: status, label: status })),
          ]}
        />

        <SelectField
          id="service"
          label="Service"
          value={search.service}
          onChange={(value) => setSearch({ service: value })}
          options={[
            { value: "all", label: "All services" },
            ...services.map((service) => ({ value: service.value, label: service.value })),
          ]}
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label
              htmlFor="from"
              className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
              From
            </Label>
            <Input
              id="from"
              type="date"
              value={search.from}
              onChange={(event) => setSearch({ from: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="to" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              To
            </Label>
            <Input
              id="to"
              type="date"
              value={search.to}
              onChange={(event) => setSearch({ to: event.target.value })}
            />
          </div>
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <Button type="submit" variant="default">
            Apply search
          </Button>
          {filtersApplied && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchText("");
                setSearch({ status: "all", service: "all", q: "", from: "", to: "" });
              }}
            >
              <X /> Clear filters
            </Button>
          )}
          <p className="ml-auto self-center text-sm text-muted-foreground">
            {query.isPending ? "Loading…" : `${total} request${total === 1 ? "" : "s"}`}
          </p>
        </div>
      </form>

      {query.isError && (
        <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Could not load the requests. Please refresh, and check that your account still has admin
          access.
        </p>
      )}

      {query.isPending ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading requests…
        </div>
      ) : query.data && query.data.rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {filtersApplied
              ? "No requests match these filters."
              : "No service requests yet. They appear here as soon as a customer submits the form."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-hidden rounded-2xl border border-border bg-card lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Request</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Area</th>
                  <th className="px-4 py-3 font-semibold">Received</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {query.data?.rows.map((request) => (
                  <tr key={request.id} className="align-top hover:bg-surface/60">
                    <td className="px-4 py-3">
                      <Link
                        to="/admin/requests/$id"
                        params={{ id: request.id }}
                        className="font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {request.request_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-medium text-foreground">{request.full_name}</span>
                      <span className="block text-xs text-muted-foreground">{request.mobile}</span>
                    </td>
                    <td className="px-4 py-3">{request.service}</td>
                    <td className="px-4 py-3 text-muted-foreground">{request.area ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(request.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="outline" asChild>
                          <a
                            href={telHrefFor(request.mobile)}
                            aria-label={`Call ${request.full_name}`}
                          >
                            <Phone />
                          </a>
                        </Button>
                        <Button size="icon" variant="whatsapp" asChild>
                          <a
                            href={whatsappHrefFor(
                              request.mobile,
                              `Hello ${request.full_name}, regarding your service request ${request.request_number}.`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`WhatsApp ${request.full_name}`}
                          >
                            <MessageCircle />
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="mt-6 space-y-3 lg:hidden">
            {query.data?.rows.map((request) => (
              <li key={request.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to="/admin/requests/$id"
                    params={{ id: request.id }}
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {request.request_number}
                  </Link>
                  <StatusBadge status={request.status} />
                </div>
                <p className="mt-2 font-medium text-foreground">
                  {request.full_name} · {request.service}
                </p>
                <p className="text-sm text-muted-foreground">
                  {request.area ? `${request.area} · ` : ""}
                  {formatDateTime(request.created_at)}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {request.problem_description}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <a href={telHrefFor(request.mobile)}>
                      <Phone /> Call
                    </a>
                  </Button>
                  <Button size="sm" variant="whatsapp" className="flex-1" asChild>
                    <a
                      href={whatsappHrefFor(
                        request.mobile,
                        `Hello ${request.full_name}, regarding your service request ${request.request_number}.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle /> WhatsApp
                    </a>
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {pageCount > 1 && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <Button
                variant="outline"
                disabled={search.page <= 1}
                onClick={() => setSearch({ page: search.page - 1 })}
              >
                Previous
              </Button>
              <p className="text-sm text-muted-foreground">
                Page {search.page} of {pageCount}
              </p>
              <Button
                variant="outline"
                disabled={search.page >= pageCount}
                onClick={() => setSearch({ page: search.page + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
