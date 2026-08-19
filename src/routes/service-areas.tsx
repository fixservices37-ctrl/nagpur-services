import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { telHref, whatsappHref } from "@/lib/business";
import { seo } from "@/lib/seo";
import { serviceAreas } from "@/lib/services";

export const Route = createFileRoute("/service-areas")({
  head: () =>
    seo({
      title: "Service Areas in Nagpur — Where We Provide Home Services",
      description:
        "We currently serve selected areas of Nagpur including Manish Nagar, Dharampeth, Sadar, Pratap Nagar, Besa and more. Contact us to confirm availability.",
      path: "/service-areas",
    }),
  component: ServiceAreasPage,
});

function ServiceAreasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Coverage"
        title="Service Areas"
        subtitle="Currently serving Nagpur and nearby areas. Contact us to confirm service availability in your location."
      />
      <Section>
        <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {serviceAreas.map((area) => (
            <li
              key={area}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
            >
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              {area}
            </li>
          ))}
        </ul>

        <p className="mt-6 rounded-xl bg-surface p-5 text-sm text-muted-foreground">
          These are examples of localities we commonly visit. Availability can depend on the exact
          location, the type of work and technician schedules, so please confirm with us before
          planning the visit.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="accent" size="lg" asChild>
            <Link to="/request-service">Request a Service</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href={telHref}>
              <Phone /> Call Now
            </a>
          </Button>
          <Button variant="whatsapp" size="lg" asChild>
            <a
              href={whatsappHref("Hi, do you provide service in my area of Nagpur?")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle /> WhatsApp Us
            </a>
          </Button>
        </div>
      </Section>
    </>
  );
}
