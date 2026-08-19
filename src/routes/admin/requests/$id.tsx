import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock, Loader2, MapPin, MessageCircle, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminAuth } from "@/components/admin/auth";
import { useRequest, useRequestPhotos, useUpdateRequest } from "@/components/admin/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_REQUEST_SEARCH,
  REQUEST_STATUSES,
  formatDate,
  formatDateTime,
  isRequestStatus,
  mapsHrefFor,
  telHrefFor,
  whatsappHrefFor,
  type RequestStatus,
} from "@/lib/admin";

export const Route = createFileRoute("/admin/requests/$id")({
  head: () => ({
    meta: [{ title: "Request — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: RequestDetailPage,
});

function RequestDetailPage() {
  const { id } = Route.useParams();
  const { isStaff } = useAdminAuth();
  const query = useRequest(id, isStaff);
  const request = query.data;

  const update = useUpdateRequest(id);
  const [status, setStatus] = useState<RequestStatus>("New");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  // Load the server values into the form once the request arrives.
  useEffect(() => {
    if (!request) return;
    setStatus(isRequestStatus(request.status) ? request.status : "New");
    setAssignedTo(request.assigned_to ?? "");
    setNotes(request.admin_notes ?? "");
  }, [request]);

  const photos = useRequestPhotos(request?.photo_paths ?? [], isStaff && !!request);

  const dirty =
    !!request &&
    (status !== request.status ||
      assignedTo.trim() !== (request.assigned_to ?? "") ||
      notes.trim() !== (request.admin_notes ?? ""));

  function onSave() {
    setSaved(false);
    update.mutate(
      {
        status,
        assigned_to: assignedTo.trim() || null,
        admin_notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          setSaved(true);
          window.setTimeout(() => setSaved(false), 3000);
        },
      },
    );
  }

  return (
    <AdminShell
      title={request?.request_number ?? "Service request"}
      description={request ? `Received ${formatDateTime(request.created_at)}` : undefined}
      actions={
        <Button variant="outline" asChild>
          <Link to="/admin/requests" search={DEFAULT_REQUEST_SEARCH}>
            <ArrowLeft /> All requests
          </Link>
        </Button>
      }
    >
      {query.isPending && (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading request…
        </div>
      )}

      {query.isError && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Could not load this request. Please refresh and try again.
        </p>
      )}

      {!query.isPending && !query.isError && !request && (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            This request no longer exists, or you do not have access to it.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/admin/requests" search={DEFAULT_REQUEST_SEARCH}>
              Back to all requests
            </Link>
          </Button>
        </div>
      )}

      {request && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card title="Customer" icon={User}>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Detail label="Name" value={request.full_name} />
                <Detail label="Mobile" value={`+91 ${request.mobile}`} />
                <Detail label="Service" value={request.service} />
                <Detail label="Status" value={<StatusBadge status={request.status} />} />
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild>
                  <a href={telHrefFor(request.mobile)}>
                    <Phone /> Call customer
                  </a>
                </Button>
                <Button variant="whatsapp" asChild>
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
            </Card>

            <Card title="Problem described">
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {request.problem_description}
              </p>
            </Card>

            <Card title="Address" icon={MapPin}>
              <p className="whitespace-pre-wrap text-sm text-foreground">{request.full_address}</p>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <Detail label="Area / locality" value={request.area ?? "—"} />
                <Detail
                  label="Shared location"
                  value={
                    request.latitude != null && request.longitude != null
                      ? `${request.latitude.toFixed(5)}, ${request.longitude.toFixed(5)}`
                      : "Not shared"
                  }
                />
              </dl>
              <Button variant="outline" className="mt-4" asChild>
                <a href={mapsHrefFor(request)} target="_blank" rel="noopener noreferrer">
                  <MapPin /> Open in Google Maps
                </a>
              </Button>
            </Card>

            <Card title="Preferred visit" icon={Clock}>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Detail label="Preferred date" value={formatDate(request.preferred_date)} />
                <Detail label="Preferred time" value={request.preferred_time ?? "—"} />
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                The customer was told this is a request only and that the team will call to confirm.
              </p>
            </Card>

            <Card title={`Photos (${request.photo_paths.length})`}>
              {request.photo_paths.length === 0 ? (
                <p className="text-sm text-muted-foreground">No photos were uploaded.</p>
              ) : photos.isPending ? (
                <p className="text-sm text-muted-foreground">Loading photos…</p>
              ) : photos.isError ? (
                <p className="text-sm text-destructive">Could not load the photos.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.data?.map((photo) => (
                    <a
                      key={photo.path}
                      href={photo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="overflow-hidden rounded-xl border border-border"
                    >
                      <img
                        src={photo.url}
                        alt="Customer upload of the reported problem"
                        loading="lazy"
                        decoding="async"
                        className="h-32 w-full object-cover transition-transform hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Update request">
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="status"
                    className="mb-1.5 block text-xs font-medium text-muted-foreground"
                  >
                    Status
                  </Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as RequestStatus)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {REQUEST_STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label
                    htmlFor="assigned_to"
                    className="mb-1.5 block text-xs font-medium text-muted-foreground"
                  >
                    Assigned technician
                  </Label>
                  <Input
                    id="assigned_to"
                    value={assignedTo}
                    maxLength={120}
                    onChange={(event) => setAssignedTo(event.target.value)}
                    placeholder="Technician name"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="admin_notes"
                    className="mb-1.5 block text-xs font-medium text-muted-foreground"
                  >
                    Internal notes
                  </Label>
                  <Textarea
                    id="admin_notes"
                    value={notes}
                    rows={5}
                    maxLength={2000}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Call outcome, confirmed visit time, parts needed…"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Only staff can see these notes.
                  </p>
                </div>

                <Button className="w-full" onClick={onSave} disabled={!dirty || update.isPending}>
                  {update.isPending ? <Loader2 className="animate-spin" /> : <Check />}
                  {update.isPending ? "Saving…" : "Save changes"}
                </Button>

                {saved && (
                  <p className="text-center text-sm font-medium text-whatsapp">Changes saved.</p>
                )}
                {update.isError && (
                  <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    Could not save the changes. Please try again.
                  </p>
                )}
              </div>
            </Card>

            <Card title="History">
              <dl className="space-y-3">
                <Detail label="Received" value={formatDateTime(request.created_at)} />
                <Detail label="Last updated" value={formatDateTime(request.updated_at)} />
                <Detail label="Request ID" value={request.request_number} />
              </dl>
            </Card>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: typeof User;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 text-base">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
