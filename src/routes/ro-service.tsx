import { createFileRoute } from "@tanstack/react-router";

import { ServiceDetail } from "@/components/site/ServiceDetail";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/ro-service")({
  head: () =>
    seo({
      title: "RO Service in Nagpur — Water Purifier Repair & Filter Change",
      description:
        "RO and water filter services in Nagpur: RO servicing, filter replacement, installation, leakage and low water flow troubleshooting.",
      path: "/ro-service",
    }),
  component: () => <ServiceDetail slug="ro-service" />,
});
