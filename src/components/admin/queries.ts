import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { RequestStatus, ServiceRequest } from "@/lib/admin";

export type ServiceArea = Tables<"service_areas">;
export type RoBrand = Tables<"ro_brands">;

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

// ---------------------------------------------------------------------------
// Service areas
// ---------------------------------------------------------------------------

/** Every area, including deactivated ones. Only staff can see deactivated rows. */
export function useServiceAreasAdmin(enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "service-areas"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_areas")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ServiceArea[];
    },
  });
}

export function useCreateServiceArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; sortOrder?: number }) => {
      const { data, error } = await supabase
        .from("service_areas")
        .insert({
          name: input.name.trim(),
          sort_order: input.sortOrder ?? 100,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as ServiceArea;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "service-areas"] });
      void queryClient.invalidateQueries({ queryKey: ["public", "service-areas"] });
    },
  });
}

interface ServiceAreaPatch {
  name?: string;
  is_active?: boolean;
  sort_order?: number;
}

export function useUpdateServiceArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; patch: ServiceAreaPatch }) => {
      const patch: ServiceAreaPatch = {};
      if (input.patch.name !== undefined) patch.name = input.patch.name.trim();
      if (input.patch.is_active !== undefined) patch.is_active = input.patch.is_active;
      if (input.patch.sort_order !== undefined) patch.sort_order = input.patch.sort_order;

      const { data, error } = await supabase
        .from("service_areas")
        .update(patch)
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      return data as ServiceArea;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "service-areas"] });
      void queryClient.invalidateQueries({ queryKey: ["public", "service-areas"] });
    },
  });
}

export function useDeleteServiceArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_areas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "service-areas"] });
      void queryClient.invalidateQueries({ queryKey: ["public", "service-areas"] });
    },
  });
}

// ---------------------------------------------------------------------------
// RO installation brands
// ---------------------------------------------------------------------------

export function useRoBrandsAdmin(enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "ro-brands"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ro_brands")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RoBrand[];
    },
  });
}

export interface RoBrandInput {
  name: string;
  tagline?: string | undefined;
  description?: string | undefined;
  imageUrl?: string | undefined;
  features?: string[] | undefined;
  stages?: number | undefined;
  warrantyMonths?: number | undefined;
  startingPriceInr?: number | undefined;
  sortOrder?: number | undefined;
}

export function useCreateRoBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RoBrandInput) => {
      const { data, error } = await supabase
        .from("ro_brands")
        .insert({
          name: input.name.trim(),
          tagline: input.tagline?.trim() || null,
          description: input.description?.trim() || null,
          image_url: input.imageUrl?.trim() || null,
          features: normaliseFeatures(input.features),
          stages: input.stages ?? null,
          warranty_months: input.warrantyMonths ?? null,
          starting_price_inr: input.startingPriceInr ?? null,
          sort_order: input.sortOrder ?? 100,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as RoBrand;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "ro-brands"] });
      void queryClient.invalidateQueries({ queryKey: ["public", "ro-brands"] });
    },
  });
}

interface RoBrandPatch {
  name?: string;
  tagline?: string | null;
  description?: string | null;
  image_url?: string | null;
  features?: string[];
  stages?: number | null;
  warranty_months?: number | null;
  starting_price_inr?: number | null;
  is_active?: boolean;
  sort_order?: number;
}

function normaliseFeatures(features?: string[] | undefined) {
  if (!features) return [];
  return features
    .map((entry) => entry.trim())
    .filter((entry, index, all) => entry.length > 0 && all.indexOf(entry) === index)
    .slice(0, 8);
}

export function useUpdateRoBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; patch: RoBrandPatch }) => {
      const patch: RoBrandPatch = {};
      if (input.patch.name !== undefined) patch.name = input.patch.name.trim();
      if (input.patch.tagline !== undefined) patch.tagline = input.patch.tagline?.trim() || null;
      if (input.patch.description !== undefined)
        patch.description = input.patch.description?.trim() || null;
      if (input.patch.image_url !== undefined)
        patch.image_url = input.patch.image_url?.trim() || null;
      if (input.patch.features !== undefined) patch.features = normaliseFeatures(input.patch.features);
      if (input.patch.stages !== undefined) patch.stages = input.patch.stages;
      if (input.patch.warranty_months !== undefined)
        patch.warranty_months = input.patch.warranty_months;
      if (input.patch.starting_price_inr !== undefined)
        patch.starting_price_inr = input.patch.starting_price_inr;
      if (input.patch.is_active !== undefined) patch.is_active = input.patch.is_active;
      if (input.patch.sort_order !== undefined) patch.sort_order = input.patch.sort_order;

      const { data, error } = await supabase
        .from("ro_brands")
        .update(patch)
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      return data as RoBrand;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "ro-brands"] });
      void queryClient.invalidateQueries({ queryKey: ["public", "ro-brands"] });
    },
  });
}

export function useDeleteRoBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ro_brands").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "ro-brands"] });
      void queryClient.invalidateQueries({ queryKey: ["public", "ro-brands"] });
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
