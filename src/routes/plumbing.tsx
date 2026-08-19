import { createFileRoute } from "@tanstack/react-router";

import { ServiceDetail } from "@/components/site/ServiceDetail";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/plumbing")({
  head: () =>
    seo({
      title: "Plumbing Services in Nagpur — Taps, Leakage & Fittings",
      description:
        "Plumbing services in Nagpur: tap repair, pipe and water leakage, bathroom and kitchen plumbing, drain blockage and sanitary fitting.",
      path: "/plumbing",
    }),
  component: () => <ServiceDetail slug="plumbing" />,
});
