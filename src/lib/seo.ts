import { business } from "@/lib/business";

/**
 * Canonical origin of the deployed site. Set VITE_SITE_URL in the hosting
 * environment; the fallback keeps local builds and previews working.
 */
export const SITE_URL = (
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SITE_URL"]) ||
  "https://nagpur-home-care.lovable.app"
)
  .toString()
  .replace(/\/+$/, "");

export function canonicalUrl(path: string) {
  return `${SITE_URL}${path === "/" ? "/" : path.replace(/\/+$/, "")}`;
}

interface SeoInput {
  title: string;
  description: string;
  /** Route path, e.g. "/services". Used for the canonical and og:url. */
  path: string;
}

/**
 * Builds the meta + link tags for a page. Spread into a route's `head()`:
 *   head: () => seo({ title, description, path })
 */
export function seo({ title, description, path }: SeoInput) {
  const url = canonicalUrl(path);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:site_name", content: business.name },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

/**
 * schema.org LocalBusiness data, so search engines can show the business as a
 * local service provider. Only facts that exist in lib/business.ts are used.
 */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: business.name,
    description:
      "Electrical, plumbing, carpenter, RO water filter and deep-cleaning services for homes in Nagpur, Maharashtra.",
    url: SITE_URL,
    telephone: business.phone,
    email: business.email,
    areaServed: { "@type": "City", name: "Nagpur" },
    address: {
      "@type": "PostalAddress",
      addressLocality: business.city,
      addressRegion: business.state,
      addressCountry: "IN",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: "10:00",
        closes: "17:00",
      },
    ],
    makesOffer: [
      "Electrical Services",
      "Plumbing Services",
      "Carpenter Services",
      "RO / Water Filter Services",
      "Bathroom & Kitchen Cleaning",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  };
}
