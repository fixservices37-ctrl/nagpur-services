import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { business, telHref, whatsappHref } from "@/lib/business";

const serviceLinks = [
  { to: "/electrical", label: "Electrical Services" },
  { to: "/plumbing", label: "Plumbing Services" },
  { to: "/carpenter", label: "Carpenter Services" },
  { to: "/ro-service", label: "RO / Water Filter Services" },
] as const;


export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-brand-deep text-primary-foreground">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-lg font-bold">{business.name}</h3>
          <p className="mt-2 text-sm text-primary-foreground/70">
            Home maintenance services in {business.city} — electrical, plumbing, carpentry and RO
            work at your doorstep.
          </p>
          <p className="mt-4 text-xs text-primary-foreground/60">
            Currently serving Nagpur and nearby areas. Contact us to confirm service availability in
            your location.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/80">
            Services
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            {serviceLinks.map((s) => (
              <li key={s.to}>
                <Link
                  to={s.to}
                  className="text-primary-foreground/75 transition-colors hover:text-primary-foreground"
                >
                  {s.label}
                </Link>
              </li>
            ))}

          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/80">
            Company
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: "/about", label: "About Us" },
              { to: "/how-it-works", label: "How It Works" },
              { to: "/service-areas", label: "Service Areas" },
              { to: "/reviews", label: "Reviews" },
              { to: "/faq", label: "FAQ" },
              { to: "/contact", label: "Contact" },
              { to: "/request-service", label: "Request a Service" },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-primary-foreground/75 transition-colors hover:text-primary-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/80">
            Contact
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" />
              <a href={telHref} className="hover:text-primary-foreground">
                {business.phoneDisplay}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <a href={`mailto:${business.email}`} className="hover:text-primary-foreground">
                {business.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{business.addressLine}</span>
            </li>
            {business.workingHours.map((w) => (
              <li key={w.days} className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {w.days}: {w.hours}
                </span>
              </li>
            ))}
            <li>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-primary-foreground"
              >
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-page flex flex-col gap-1 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <p>Business details shown here are placeholders until confirmed.</p>
            <Link
              to="/admin"
              className="underline underline-offset-4 hover:text-primary-foreground"
            >
              Staff login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
