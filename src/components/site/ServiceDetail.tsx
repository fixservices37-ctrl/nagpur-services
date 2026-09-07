import { Link } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle, Phone, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { telHref, whatsappHref } from "@/lib/business";
import { getService, howItWorks } from "@/lib/services";

export function ServiceDetail({ slug }: { slug: string }) {
  const service = getService(slug)!;

  return (
    <>
      <PageHeader eyebrow="Nagpur home services" title={service.title} subtitle={service.short} />

      <Section className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:items-start">
        <div className="order-2 lg:order-1">
          <h2 className="text-xl sm:text-2xl">What we handle</h2>
          <ul className="mt-4 grid gap-2.5 sm:mt-6 sm:grid-cols-2 sm:gap-3">
            {service.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-sm"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 grid gap-2 sm:mt-8 sm:flex sm:flex-wrap sm:gap-3">
            <Button variant="accent" size="lg" asChild className="w-full sm:w-auto">
              <Link to="/request-service" search={{ service: service.value }}>
                {service.cta}
              </Link>
            </Button>
            {service.installationCta && (
              <Button variant="default" size="lg" asChild className="w-full sm:w-auto">
                {service.installationCta.brandChooserPath ? (
                  <Link to={service.installationCta.brandChooserPath}>
                    <Sparkles /> {service.installationCta.label}
                  </Link>
                ) : (
                  <Link
                    to="/request-service"
                    search={{ service: service.value, intent: "installation" }}
                  >
                    <Sparkles /> {service.installationCta.label}
                  </Link>
                )}
              </Button>
            )}
            <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
              <a href={telHref}>
                <Phone /> Call Now
              </a>
            </Button>
            <Button variant="whatsapp" size="lg" asChild className="w-full sm:w-auto">
              <a
                href={whatsappHref(`Hi, I need ${service.title.toLowerCase()} in Nagpur.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle /> WhatsApp Us
              </a>
            </Button>
          </div>
        </div>

        <div className="order-1 space-y-5 sm:space-y-6 lg:order-2">
          <img
            src={service.image}
            alt={`${service.title} in Nagpur`}
            width={900}
            height={640}
            loading="lazy"
            className="aspect-16/10 w-full rounded-2xl object-cover shadow-card"
          />
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <h3 className="text-lg">How it works</h3>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              {howItWorks.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span>
                    <strong className="text-foreground">{step.title}.</strong> {step.text}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>
    </>
  );
}
