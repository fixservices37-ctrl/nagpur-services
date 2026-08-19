import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { business, telHref, whatsappHref } from "@/lib/business";
import { localBusinessJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    ...seo({
      title: "Contact Us — Home Repair Services in Nagpur",
      description:
        "Call or WhatsApp us for electrical, plumbing, carpentry and RO services in Nagpur, or submit a service request online.",
      path: "/contact",
    }),
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(localBusinessJsonLd()) },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Contact Us"
        subtitle="The fastest way to reach us is a phone call or WhatsApp message. You can also send a service request and we will call you back."
      />

      <Section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <a
            href={telHref}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-[var(--shadow-card)]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Phone className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm text-muted-foreground">Call Now</span>
              <span className="block text-lg font-semibold text-foreground">
                {business.phoneDisplay}
              </span>
            </span>
          </a>

          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-[var(--shadow-card)]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-whatsapp text-whatsapp-foreground">
              <MessageCircle className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm text-muted-foreground">Chat on WhatsApp</span>
              <span className="block text-lg font-semibold text-foreground">
                {business.phoneDisplay}
              </span>
            </span>
          </a>

          <a
            href={`mailto:${business.email}`}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-[var(--shadow-card)]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Mail className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm text-muted-foreground">Email</span>
              <span className="block text-lg font-semibold text-foreground">{business.email}</span>
            </span>
          </a>

          <Button variant="accent" size="xl" className="w-full" asChild>
            <Link to="/request-service">Request a Service</Link>
          </Button>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" /> Service area
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{business.addressLine}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Currently serving Nagpur and nearby areas. Contact us to confirm service availability
              in your location.
            </p>
            <Button variant="link" className="mt-2 px-0" asChild>
              <Link to="/service-areas">View service areas</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" /> Working hours
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {business.workingHours.map((w) => (
                <li key={w.days} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{w.days}</span>
                  <span className="font-medium text-foreground">{w.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            Contact details on this page are placeholders and will be updated with the confirmed
            business details.
          </p>
        </div>
      </Section>
    </>
  );
}
