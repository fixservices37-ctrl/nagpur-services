import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, Section } from "@/components/site/PageHeader";
import { ServiceCards } from "@/components/site/ServiceCards";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/services")({
  head: () =>
    seo({
      title: "Our Services — Electrician, Plumber, Carpenter & RO in Nagpur",
      description:
        "Home repair services in Nagpur: electrical work, plumbing, carpentry and RO water filter servicing. Request a technician visit online.",
      path: "/services",
    }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="What we do"
        title="Our Services"
        subtitle="We handle everyday home maintenance work in Nagpur. Pick a service to see what is covered, or submit a request and we will call you."
      />
      <Section>
        <ServiceCards />
      </Section>
    </>
  );
}
