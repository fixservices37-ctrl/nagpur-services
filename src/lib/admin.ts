import type { Tables } from "@/integrations/supabase/types";

export type ServiceRequest = Tables<"service_requests">;

/** Workflow states — must stay in sync with service_requests_status_check in the database. */
export const REQUEST_STATUSES = [
  "New",
  "Contacted",
  "Scheduled",
  "In Progress",
  "Completed",
  "Cancelled",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

/** Statuses that still need the owner to do something. */
export const OPEN_STATUSES: RequestStatus[] = ["New", "Contacted", "Scheduled", "In Progress"];

export const STATUS_STYLES: Record<RequestStatus, string> = {
  New: "bg-accent/20 text-accent-foreground border-accent/40",
  Contacted: "bg-primary/10 text-primary border-primary/30",
  Scheduled: "bg-primary/10 text-primary border-primary/30",
  "In Progress": "bg-secondary text-secondary-foreground border-border",
  Completed: "bg-whatsapp/15 text-whatsapp border-whatsapp/30",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

export function isRequestStatus(value: string): value is RequestStatus {
  return (REQUEST_STATUSES as readonly string[]).includes(value);
}

/** URL state of the request list. Every field is always present so links to
 *  the list are fully typed. */
export interface RequestListSearch {
  status: string;
  service: string;
  q: string;
  from: string;
  to: string;
  page: number;
}

export const DEFAULT_REQUEST_SEARCH: RequestListSearch = {
  status: "all",
  service: "all",
  q: "",
  from: "",
  to: "",
  page: 1,
};

const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
});

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : dateTimeFormat.format(parsed);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  // Date-only columns come back as YYYY-MM-DD; parse as local to avoid a timezone shift.
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : dateFormat.format(parsed);
}

/** "2 hours ago" style label for list rows. */
export function relativeTime(value: string) {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "—";
  const diffMinutes = Math.round((then - Date.now()) / 60000);
  const absolute = Math.abs(diffMinutes);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (absolute < 60) return rtf.format(diffMinutes, "minute");
  if (absolute < 60 * 24) return rtf.format(Math.round(diffMinutes / 60), "hour");
  return rtf.format(Math.round(diffMinutes / (60 * 24)), "day");
}

export function telHrefFor(mobile: string) {
  return `tel:+91${mobile}`;
}

export function whatsappHrefFor(mobile: string, message: string) {
  return `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`;
}

export function mapsHrefFor(
  request: Pick<ServiceRequest, "latitude" | "longitude" | "full_address">,
) {
  if (request.latitude != null && request.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${request.latitude},${request.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(request.full_address)}`;
}

const CSV_COLUMNS = [
  "request_number",
  "created_at",
  "status",
  "service",
  "full_name",
  "mobile",
  "area",
  "full_address",
  "problem_description",
  "preferred_date",
  "preferred_time",
  "assigned_to",
  "admin_notes",
  "latitude",
  "longitude",
] as const;

function csvCell(value: unknown) {
  if (value == null) return "";
  const text = String(value);
  // Guard against spreadsheet formula injection from customer-entered text.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(rows: ServiceRequest[]) {
  const header = CSV_COLUMNS.join(",");
  const body = rows
    .map((row) => CSV_COLUMNS.map((column) => csvCell(row[column])).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

export function downloadCsv(filename: string, csv: string) {
  // A UTF-8 BOM keeps Excel happy with non-ASCII names and addresses.
  const BOM = String.fromCharCode(0xfeff);
  const blob = new Blob([`${BOM}${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
