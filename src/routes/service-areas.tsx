import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { telHref, whatsappHref } from "@/lib/business";
import { seo } from "@/lib/seo";
import { useServiceAreas } from "@/lib/useServiceAreas";

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
  const { data: areas = [] } = useServiceAreas();
  return (
    <>
      <PageHeader
        eyebrow="Coverage"
        title="Service Areas"
        subtitle="Currently serving Nagpur and nearby areas. Contact us to confirm service availability in your location."
      />
      <Section>
        <ul className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {areas.map((area) => (
            <li
              key={area.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
            >
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              {area.name}
            </li>
          ))}
        </ul>

        <p className="mt-6 rounded-xl bg-surface p-5 text-sm text-muted-foreground">
          These are examples of localities we commonly visit. Availability can depend on the exact
          location, the type of work and technician schedules, so please confirm with us before
          planning the visit.
        </p>

        <div className="mt-8 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <Button variant="accent" size="lg" asChild className="w-full sm:w-auto">
            <Link to="/request-service">Request a Service</Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
            <a href={telHref}>
              <Phone /> Call Now
            </a>
          </Button>
          <Button variant="whatsapp" size="lg" asChild className="w-full sm:w-auto">
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
