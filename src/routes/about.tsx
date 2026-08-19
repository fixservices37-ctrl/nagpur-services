import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { business } from "@/lib/business";
import { seo } from "@/lib/seo";
import { whyChooseUs } from "@/lib/services";

export const Route = createFileRoute("/about")({
  head: () =>
    seo({
      title: "About Us — Local Home Repair Team in Nagpur",
      description:
        "We are a small local home maintenance business in Nagpur providing electrical, plumbing, carpentry and RO services with direct phone support.",
      path: "/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title={`About ${business.name}`}
        subtitle="We are a small, local home maintenance business based in Nagpur. Our team handles everyday household repairs — electrical, plumbing, carpentry and RO water filter work — at your home."
      />

      <Section className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4 text-muted-foreground">
          <p>
            Most household problems are small but urgent — a leaking tap, a switch that stopped
            working, a door that does not close, or an RO unit that needs servicing. Finding someone
            reliable for that kind of work takes time, and that is the gap we try to fill.
          </p>
          <p>
            You send us the problem through the request form, or simply call or WhatsApp us. We
            speak with you to understand the job, confirm a convenient visit time and assign a
            technician who does that type of work. Payment is collected directly after the work is
            completed.
          </p>
          <p>
            We keep things intentionally simple: no accounts, no apps, no online payments — just a
            clear request, a phone call and a technician at your door.
          </p>
          <p className="text-sm">
            Note: business name, phone number and address shown on this website are placeholders and
            will be updated with confirmed details.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-xl">What you can expect</h2>
          <ul className="mt-5 space-y-3">
            {whyChooseUs.map((item) => (
              <li key={item.title} className="flex gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <strong className="text-foreground">{item.title}.</strong>{" "}
                  <span className="text-muted-foreground">{item.text}</span>
                </span>
              </li>
            ))}
          </ul>
          <Button variant="accent" size="lg" className="mt-6 w-full" asChild>
            <Link to="/request-service">Request a Service</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
