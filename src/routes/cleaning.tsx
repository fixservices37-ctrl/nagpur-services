import { createFileRoute } from "@tanstack/react-router";

import { ServiceDetail } from "@/components/site/ServiceDetail";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/cleaning")({
  head: () =>
    seo({
      title: "Bathroom & Kitchen Cleaning in Nagpur — Deep Cleaning Services",
      description:
        "Deep cleaning services in Nagpur: bathroom and kitchen deep cleaning, combos, wash basin and toilet cleaning, and appliance cleaning for fridge, microwave and chimney.",
      path: "/cleaning",
    }),
  component: () => <ServiceDetail slug="cleaning" />,
});
