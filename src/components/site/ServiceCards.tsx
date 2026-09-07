import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { services } from "@/lib/services";

const servicePaths = {
  electrical: "/electrical",
  plumbing: "/plumbing",
  carpenter: "/carpenter",
  "ro-service": "/ro-service",
  cleaning: "/cleaning",
} as const;

export function ServiceCards() {
  return (
    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
      {services.map((service) => (
        <article
          key={service.slug}
          className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card"
        >
          <img
            src={service.image}
            alt={service.title}
            width={900}
            height={640}
            loading="lazy"
            decoding="async"
            className="h-40 w-full object-cover sm:h-44"
          />
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <h3 className="text-lg sm:text-xl">{service.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{service.short}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              {service.items.slice(0, 4).map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-5 grid gap-2 pt-2 sm:mt-6 sm:flex sm:flex-wrap sm:gap-3">
              <Button variant="accent" asChild className="w-full sm:w-auto">
                <Link to="/request-service" search={{ service: service.value }}>
                  {service.cta}
                </Link>
              </Button>
              {service.installationCta &&
                (service.installationCta.brandChooserPath ? (
                  <Button variant="outline" asChild className="w-full sm:w-auto">
                    <Link to={service.installationCta.brandChooserPath}>
                      <Sparkles /> {service.installationCta.label}
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" asChild className="w-full sm:w-auto">
                    <Link
                      to="/request-service"
                      search={{ service: service.value, intent: "installation" }}
                    >
                      <Sparkles /> {service.installationCta.label}
                    </Link>
                  </Button>
                ))}
              <Button variant="ghost" asChild className="w-full sm:w-auto">
                <Link to={servicePaths[service.slug as keyof typeof servicePaths]}>
                  Details <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
