import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { serviceAreas as fallbackAreas } from "@/lib/services";

/**
 * Active service areas, in display order. The static list in services.ts is
 * used as `initialData` so SSR renders instantly and search engines see the
 * same list as before the DB moved. Once the client hydrates, React Query
 * refreshes from Supabase.
 */
export function useServiceAreas() {
  return useQuery({
    queryKey: ["public", "service-areas"],
    staleTime: 5 * 60_000,
    initialData: () => fallbackAreas.map((name, index) => ({ id: name, name, sortOrder: index })),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_areas")
        .select("id, name, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        sortOrder: row.sort_order,
      }));
    },
  });
}
