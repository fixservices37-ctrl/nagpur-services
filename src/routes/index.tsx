import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, MessageCircle, Phone, ShieldCheck, Clock, MapPin } from "lucide-react";

import heroImage from "@/assets/hero-technician.jpg";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/PageHeader";
import { ServiceCards } from "@/components/site/ServiceCards";
import { business, telHref, whatsappHref } from "@/lib/business";
import { localBusinessJsonLd, seo } from "@/lib/seo";
import { howItWorks, whyChooseUs } from "@/lib/services";
import { useServiceAreas } from "@/lib/useServiceAreas";

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
  const { data: areas = [] } = useServiceAreas();
  return (
    <>
      <section className="bg-surface">
        <div className="container-page grid items-center gap-8 py-10 sm:gap-10 sm:py-14 lg:grid-cols-2 lg:py-20">
          <div className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-primary">
              <MapPin className="h-3.5 w-3.5" /> Serving Nagpur & nearby areas
            </span>
            <h1 className="mt-4 text-3xl leading-tight text-foreground sm:mt-5 sm:text-4xl lg:text-5xl">
              Reliable Home Maintenance Services in Nagpur
            </h1>
            <p className="mt-3 max-w-xl text-base text-muted-foreground sm:mt-4 sm:text-lg">
              Electrical, Plumbing, Carpenter, RO &amp; Cleaning Services at Your Doorstep.
            </p>

            <div className="mt-6 grid gap-2.5 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
              <Button variant="accent" size="xl" asChild className="w-full sm:w-auto">
                <Link to="/request-service">
                  Request a Service <ArrowRight />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild className="w-full sm:w-auto">
                <a href={telHref}>
                  <Phone /> Call Now
                </a>
              </Button>
              <Button variant="whatsapp" size="xl" asChild className="w-full sm:w-auto">
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle /> WhatsApp Us
                </a>
              </Button>
            </div>

            <ul className="mt-6 grid gap-2.5 text-sm text-foreground sm:mt-8 sm:grid-cols-3 sm:gap-3">
              {[
                { icon: ShieldCheck, text: "Experienced technicians" },
                { icon: Clock, text: "Quick response on call" },
                { icon: CheckCircle2, text: "No account needed" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-primary" /> {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative order-1 lg:order-2">
            <img
              src={heroImage}
              alt="Home maintenance technician at a customer's door in Nagpur"
              width={1600}
              height={1100}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="aspect-4/3 w-full rounded-2xl object-cover shadow-lift sm:aspect-16/10 sm:rounded-3xl lg:aspect-auto"
            />
          </div>
        </div>
      </section>

      <Section>
        <h2 className="text-2xl sm:text-3xl">Our Services</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Home maintenance services handled by technicians who visit your home in Nagpur.
        </p>
        <div className="mt-6 sm:mt-8">
          <ServiceCards />
        </div>
      </Section>

      <section className="bg-surface">
        <div className="container-page py-10 sm:py-14 lg:py-16">
          <h2 className="text-2xl sm:text-3xl">How It Works</h2>
          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {howItWorks.map((step, i) => (
              <div key={step.title} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
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
        <h2 className="text-2xl sm:text-3xl">Why Choose Us</h2>
        <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {whyChooseUs.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
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

      <Section className="pt-0!">
        <div className="rounded-2xl border border-border bg-surface p-5 sm:rounded-3xl sm:p-8 lg:p-10">
          <h2 className="text-xl sm:text-2xl">Areas We Serve in Nagpur</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Currently serving Nagpur and nearby areas. Contact us to confirm service availability in
            your location.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {areas.slice(0, 10).map((area) => (
              <li
                key={area.id}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground"
              >
                {area.name}
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
        <div className="container-page flex flex-col items-start gap-5 py-10 text-primary-foreground sm:gap-6 sm:py-14 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl">Have a problem at home?</h2>
            <p className="mt-2 text-sm text-primary-foreground/75">
              Send us the details and {business.name} will call you back to confirm the visit.
            </p>
          </div>
          <div className="grid w-full gap-2.5 sm:flex sm:w-auto sm:flex-wrap sm:gap-3">
            <Button variant="accent" size="lg" asChild className="w-full sm:w-auto">
              <Link to="/request-service">Request a Service</Link>
            </Button>
            <Button variant="onDark" size="lg" asChild className="w-full sm:w-auto">
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
