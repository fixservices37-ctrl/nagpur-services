import { createFileRoute } from "@tanstack/react-router";

import { ServiceDetail } from "@/components/site/ServiceDetail";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/carpenter")({
  head: () =>
    seo({
      title: "Carpenter in Nagpur — Furniture & Door Repair Services",
      description:
        "Carpenter services in Nagpur: furniture and door repair, cabinet work, shelf installation, furniture assembly, hinges and handles.",
      path: "/carpenter",
    }),
  component: () => <ServiceDetail slug="carpenter" />,
});
