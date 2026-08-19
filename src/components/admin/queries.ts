import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { RequestStatus, ServiceRequest } from "@/lib/admin";

export interface RequestFilters {
  status: string;
  service: string;
  search: string;
  from: string;
  to: string;
  page: number;
  pageSize: number;
}

export interface RequestStats {
  total: number;
  new: number;
  contacted: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  open: number;
  today: number;
  last_7_days: number;
}

const SELECT_COLUMNS = "*";

/** PostgREST `.or()` treats these as syntax, and `%`/`_` are ilike wildcards. */
function sanitiseSearch(term: string) {
  return term
    .trim()
    .replace(/[,()%_*]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

/**
 * Narrowing a PostgREST builder through conditional `.eq()/.or()` calls loses
 * its generic parameters, so the builder is threaded through untyped and the
 * caller's type is restored on the way out.
 */
function applyFilters<T>(query: T, filters: Omit<RequestFilters, "page" | "pageSize">): T {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let next = query as any;

  if (filters.status && filters.status !== "all") {
    next = next.eq("status", filters.status);
  }
  if (filters.service && filters.service !== "all") {
    next = next.eq("service", filters.service);
  }
  if (filters.from) {
    next = next.gte("created_at", `${filters.from}T00:00:00`);
  }
  if (filters.to) {
    // Inclusive end date.
    next = next.lte("created_at", `${filters.to}T23:59:59.999`);
  }

  const search = sanitiseSearch(filters.search ?? "");
  if (search) {
    const digits = search.replace(/\D/g, "");
    const clauses = [
      `full_name.ilike.*${search}*`,
      `request_number.ilike.*${search}*`,
      `area.ilike.*${search}*`,
      `full_address.ilike.*${search}*`,
      ...(digits ? [`mobile.ilike.*${digits}*`] : []),
    ];
    next = next.or(clauses.join(","));
  }

  return next as T;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export function requestListQueryKey(filters: RequestFilters) {
  return ["admin", "requests", filters] as const;
}

export function useRequests(filters: RequestFilters, enabled: boolean) {
  return useQuery({
    queryKey: requestListQueryKey(filters),
    enabled,
    staleTime: 15_000,
    queryFn: async () => {
      const start = (filters.page - 1) * filters.pageSize;
      const query = applyFilters(
        supabase.from("service_requests").select(SELECT_COLUMNS, { count: "exact" }),
        filters,
      )
        .order("created_at", { ascending: false })
        .range(start, start + filters.pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { rows: (data ?? []) as ServiceRequest[], total: count ?? 0 };
    },
  });
}

/** Full result set for the current filters, used by the CSV export. */
export async function fetchRequestsForExport(filters: RequestFilters) {
  const query = applyFilters(supabase.from("service_requests").select(SELECT_COLUMNS), filters)
    .order("created_at", { ascending: false })
    .limit(5000);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ServiceRequest[];
}

export function useRequest(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "request", id],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select(SELECT_COLUMNS)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as ServiceRequest | null;
    },
  });
}

export function useRequestStats(enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "stats"],
    enabled,
    staleTime: 15_000,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_request_stats");
      if (error) throw error;
      return data as unknown as RequestStats;
    },
  });
}

/** The most recent requests, for the dashboard. */
export function useRecentRequests(enabled: boolean, limit = 8) {
  return useQuery({
    queryKey: ["admin", "recent", limit],
    enabled,
    staleTime: 15_000,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select(SELECT_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as ServiceRequest[];
    },
  });
}

export interface RequestUpdate {
  status?: RequestStatus;
  assigned_to?: string | null;
  admin_notes?: string | null;
}

export function useUpdateRequest(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patch: RequestUpdate) => {
      const { data, error } = await supabase
        .from("service_requests")
        .update(patch)
        .eq("id", id)
        .select(SELECT_COLUMNS)
        .single();
      if (error) throw error;
      return data as ServiceRequest;
    },
    onSuccess: (row) => {
      queryClient.setQueryData(["admin", "request", id], row);
      void queryClient.invalidateQueries({ queryKey: ["admin", "requests"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "recent"] });
    },
  });
}

/** Signed URLs for the customer's uploaded photos (the bucket is private). */
export function useRequestPhotos(paths: string[], enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "photos", paths],
    enabled: enabled && paths.length > 0,
    staleTime: 30 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("request-photos")
        .createSignedUrls(paths, 60 * 60);
      if (error) throw error;
      return (data ?? [])
        .map((item) => ({ path: item.path ?? "", url: item.signedUrl ?? "" }))
        .filter((item) => item.url !== "");
    },
  });
}
