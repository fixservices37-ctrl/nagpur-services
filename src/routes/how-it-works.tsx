import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { seo } from "@/lib/seo";
import { howItWorks } from "@/lib/services";

export const Route = createFileRoute("/how-it-works")({
  head: () =>
    seo({
      title: "How It Works — Booking a Home Repair Visit in Nagpur",
      description:
        "Four simple steps: request a service, we call you to confirm, a technician visits your home in Nagpur, and the problem is solved.",
      path: "/how-it-works",
    }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="Process"
        title="How It Works"
        subtitle="No accounts, no complicated booking system. Four steps from your request to a completed repair."
      />
      <Section>
        <ol className="grid gap-5 sm:grid-cols-2">
          {howItWorks.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-base font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h2 className="mt-4 text-lg">{step.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl bg-accent/15 p-5 text-sm text-foreground">
          Your preferred date and time are requests only. Nothing is auto-confirmed — our team calls
          you before any technician is assigned.
        </div>

        <Button variant="accent" size="lg" className="mt-8" asChild>
          <Link to="/request-service">Request a Service</Link>
        </Button>
      </Section>
    </>
  );
}
