import { createFileRoute } from "@tanstack/react-router";

import { ServiceDetail } from "@/components/site/ServiceDetail";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/electrical")({
  head: () =>
    seo({
      title: "Electrician in Nagpur — Home Electrical Repair Services",
      description:
        "Home electrical services in Nagpur: switch and socket repair, fan and light installation, MCB issues and wiring work. Request a visit online.",
      path: "/electrical",
    }),
  component: () => <ServiceDetail slug="electrical" />,
});
