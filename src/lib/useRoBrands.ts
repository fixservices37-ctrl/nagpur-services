import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface PublicRoBrand {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  imageUrl: string | null;
  features: string[];
  stages: number | null;
  warrantyMonths: number | null;
  startingPriceInr: number | null;
  sortOrder: number;
}

/**
 * Fallback for SSR / offline builds. Values are deliberately generic — the
 * real brand information is edited in the admin panel and served from the
 * database. This mirrors the migration's default backfill so SSR output
 * matches what customers see once the client hydrates.
 */
export const fallbackRoBrands: PublicRoBrand[] = [
  {
    id: "fallback-aqua-fresh",
    name: "Aqua Fresh",
    tagline: "Multi-stage RO with copper and alkaline",
    description:
      "A popular everyday RO with copper, mineral and alkaline stages. Detachable tank options available.",
    imageUrl: null,
    features: ["RO purification", "Copper stage", "Alkaline stage", "Wall / counter-top mount"],
    stages: 7,
    warrantyMonths: 12,
    startingPriceInr: 9000,
    sortOrder: 10,
  },
  {
    id: "fallback-purosis",
    name: "Purosis",
    tagline: "Multi-stage RO for everyday use",
    description:
      "Reliable RO for Nagpur homes with multi-stage filtration and an alkaline mineral cartridge.",
    imageUrl: null,
    features: ["RO purification", "Copper stage", "Alkaline stage", "Wall / counter-top mount"],
    stages: 7,
    warrantyMonths: 12,
    startingPriceInr: 9000,
    sortOrder: 20,
  },
  {
    id: "fallback-lexpure",
    name: "Lexpure",
    tagline: "5-stage RO with smart timer display",
    description:
      "A step-up option with a smart timer display and a larger 15–18 L storage tank. Suits bigger households.",
    imageUrl: null,
    features: ["5-stage purification", "Smart timer display", "15–18 L storage", "Sterling silver finish"],
    stages: 5,
    warrantyMonths: 12,
    startingPriceInr: 20499,
    sortOrder: 30,
  },
  {
    id: "fallback-fonix",
    name: "Fonix",
    tagline: "Compact wall-mount purifier",
    description:
      "A compact, modern RO that suits smaller kitchens and modular fittings. Wall-mount design.",
    imageUrl: null,
    features: ["RO purification", "Copper stage", "Alkaline stage", "Wall / counter-top mount"],
    stages: 7,
    warrantyMonths: 12,
    startingPriceInr: 9000,
    sortOrder: 40,
  },
];

export function useRoBrands() {
  return useQuery({
    queryKey: ["public", "ro-brands"],
    staleTime: 5 * 60_000,
    initialData: () => fallbackRoBrands,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ro_brands")
        .select(
          "id, name, tagline, description, image_url, features, stages, warranty_months, starting_price_inr, sort_order",
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(
        (row): PublicRoBrand => ({
          id: row.id,
          name: row.name,
          tagline: row.tagline,
          description: row.description,
          imageUrl: row.image_url,
          features: row.features ?? [],
          stages: row.stages,
          warrantyMonths: row.warranty_months,
          startingPriceInr: row.starting_price_inr,
          sortOrder: row.sort_order,
        }),
      );
    },
  });
}

/** Format an INR integer as "₹20,499" — for card price lines. */
export function formatInr(value: number | null | undefined) {
  if (value == null) return null;
  return `₹${value.toLocaleString("en-IN")}`;
}
