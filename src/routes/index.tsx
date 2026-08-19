import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, MessageCircle, Phone, ShieldCheck, Clock, MapPin } from "lucide-react";

import heroImage from "@/assets/hero-technician.jpg";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/PageHeader";
import { ServiceCards } from "@/components/site/ServiceCards";
import { business, telHref, whatsappHref } from "@/lib/business";
import { localBusinessJsonLd, seo } from "@/lib/seo";
import { howItWorks, serviceAreas, whyChooseUs } from "@/lib/services";

export const Route = createFileRoute("/")({
  head: () => ({
    ...seo({
      title: "Home Maintenance Services in Nagpur — Electrical, Plumbing, RO",
      description:
        "Reliable home maintenance services in Nagpur. Electrical, plumbing, carpenter and RO water filter services at your doorstep. Request a service online or call us.",
      path: "/",
    }),
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(localBusinessJsonLd()) },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="bg-surface">
        <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-primary">
              <MapPin className="h-3.5 w-3.5" /> Serving Nagpur & nearby areas
            </span>
            <h1 className="mt-5 text-4xl leading-tight text-foreground sm:text-5xl">
              Reliable Home Maintenance Services in Nagpur
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Electrical, Plumbing, Carpenter, RO &amp; Cleaning Services at Your Doorstep.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button variant="accent" size="xl" asChild>
                <Link to="/request-service">
                  Request a Service <ArrowRight />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <a href={telHref}>
                  <Phone /> Call Now
                </a>
              </Button>
              <Button variant="whatsapp" size="xl" asChild>
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle /> WhatsApp Us
                </a>
              </Button>
            </div>

            <ul className="mt-8 grid gap-3 text-sm text-foreground sm:grid-cols-3">
              {[
                { icon: ShieldCheck, text: "Experienced technicians" },
                { icon: Clock, text: "Quick response on call" },
                { icon: CheckCircle2, text: "No account needed" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" /> {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Home maintenance technician at a customer's door in Nagpur"
              width={1600}
              height={1100}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]"
            />
          </div>
        </div>
      </section>

      <Section>
        <h2 className="text-3xl">Our Services</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Home maintenance services handled by technicians who visit your home in Nagpur.
        </p>
        <div className="mt-8">
          <ServiceCards />
        </div>
      </Section>

      <section className="bg-surface">
        <div className="container-page py-14 sm:py-16">
          <h2 className="text-3xl">How It Works</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, i) => (
              <div key={step.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section>
        <h2 className="text-3xl">Why Choose Us</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="text-base">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-10">
          <h2 className="text-2xl">Areas We Serve in Nagpur</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Currently serving Nagpur and nearby areas. Contact us to confirm service availability in
            your location.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {serviceAreas.slice(0, 10).map((area) => (
              <li
                key={area}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground"
              >
                {area}
              </li>
            ))}
          </ul>
          <Button variant="link" className="mt-4 px-0" asChild>
            <Link to="/service-areas">
              See all service areas <ArrowRight />
            </Link>
          </Button>
        </div>
      </Section>

      <section className="bg-brand-deep">
        <div className="container-page flex flex-col items-start gap-6 py-14 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl">Have a problem at home?</h2>
            <p className="mt-2 text-sm text-primary-foreground/75">
              Send us the details and {business.name} will call you back to confirm the visit.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="accent" size="lg" asChild>
              <Link to="/request-service">Request a Service</Link>
            </Button>
            <Button variant="onDark" size="lg" asChild>
              <a href={telHref}>
                <Phone /> {business.phoneDisplay}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
