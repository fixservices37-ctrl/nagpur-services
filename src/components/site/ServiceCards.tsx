import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

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
    <div className="grid gap-6 sm:grid-cols-2">
      {services.map((service) => (
        <article
          key={service.slug}
          className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
        >
          <img
            src={service.image}
            alt={service.title}
            width={900}
            height={640}
            loading="lazy"
            decoding="async"
            className="h-44 w-full object-cover"
          />
          <div className="flex flex-1 flex-col p-6">
            <h3 className="text-xl">{service.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{service.short}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              {service.items.slice(0, 4).map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3 pt-2">
              <Button variant="accent" asChild>
                <Link to="/request-service" search={{ service: service.value }}>
                  {service.cta}
                </Link>
              </Button>
              <Button variant="ghost" asChild>
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
