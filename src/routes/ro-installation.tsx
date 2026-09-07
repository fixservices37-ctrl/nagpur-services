import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Droplets,
  Layers,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";

import { BrandVisual } from "@/components/site/BrandVisual";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { telHref, whatsappHref } from "@/lib/business";
import { seo } from "@/lib/seo";
import { useRoBrands, type PublicRoBrand } from "@/lib/useRoBrands";

export const Route = createFileRoute("/ro-installation")({
  head: () =>
    seo({
      title: "New RO Installation in Nagpur — Choose a Water Purifier",
      description:
        "Pick a water purifier brand for a new home installation in Nagpur. Our team calls you to confirm the model, price and installation visit.",
      path: "/ro-installation",
    }),
  component: RoInstallationPage,
});

function RoInstallationPage() {
  const { data: brands = [] } = useRoBrands();

  return (
    <>
      <PageHeader
        eyebrow="New RO installation"
        title="Choose a water purifier"
        subtitle="These are the brands we install in Nagpur. Pick one and our team will call to confirm the exact model, price and installation visit. Not sure which is right? Ask for a recommendation."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {brands.map((brand, index) => (
            <BrandCard key={brand.id} brand={brand} index={index} />
          ))}

          <RecommendCard />
        </div>

        <HowItWorks />

        <div className="mt-8 grid gap-2 sm:mt-10 sm:flex sm:flex-wrap sm:gap-3">
          <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
            <a href={telHref}>
              <Phone /> Call now
            </a>
          </Button>
          <Button variant="whatsapp" size="lg" asChild className="w-full sm:w-auto">
            <a
              href={whatsappHref("Hi, I'd like a new RO installation in Nagpur.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle /> WhatsApp us
            </a>
          </Button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Images shown are neutral placeholders. Brand names refer to third-party water purifier
          manufacturers whose products this business installs — no affiliation or endorsement is
          implied. Prices and specifications are indicative; the exact model, price and warranty are
          confirmed with you over a call before the visit.
        </p>
      </Section>
    </>
  );
}

function BrandCard({ brand, index }: { brand: PublicRoBrand; index: number }) {
  const hasMeta = brand.stages != null || brand.warrantyMonths != null;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <BrandVisual imageUrl={brand.imageUrl} name={brand.name} index={index} />

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg leading-tight">{brand.name}</h2>
        {brand.tagline && (
          <p className="mt-0.5 text-sm font-medium text-primary">{brand.tagline}</p>
        )}

        {hasMeta && (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {brand.stages != null && (
              <li className="inline-flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-primary" /> {brand.stages}-stage purification
              </li>
            )}
            {brand.warrantyMonths != null && (
              <li className="inline-flex items-center gap-1">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" /> {brand.warrantyMonths}-month
                warranty
              </li>
            )}
          </ul>
        )}

        {brand.features.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {brand.features.map((feature) => (
              <li
                key={feature}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground"
              >
                <Droplets className="h-3 w-3 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        )}

        {brand.description && (
          <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{brand.description}</p>
        )}

        <div className="mt-5 flex-1" />

        <Button variant="accent" size="lg" asChild className="w-full">
          <Link
            to="/request-service"
            search={{
              service: "RO / Water Filter",
              intent: "installation",
              brand: brand.name,
            }}
          >
            Request installation <ArrowRight />
          </Link>
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Team calls you to confirm the model, price and visit time.
        </p>
      </div>
    </article>
  );
}

function RecommendCard() {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-dashed border-border bg-surface p-5">
      <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
        <Sparkles className="h-5 w-5" />
      </span>
      <h2 className="text-lg leading-tight">Not sure which one?</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell us about your family size, water source and budget. We'll suggest a brand and model
        that fits your home.
      </p>

      <div className="mt-4 flex-1" />

      <div className="flex flex-col gap-2">
        <Button variant="default" size="lg" asChild>
          <Link
            to="/request-service"
            search={{ service: "RO / Water Filter", intent: "installation" }}
          >
            Ask for a recommendation <ArrowRight />
          </Link>
        </Button>
        <Button variant="whatsapp" size="lg" asChild>
          <a
            href={whatsappHref(
              "Hi, I would like a recommendation for a new RO / water purifier for my home in Nagpur.",
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle /> WhatsApp us
          </a>
        </Button>
      </div>
    </article>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Request", text: "Pick a brand or ask for a recommendation." },
    { title: "We call", text: "We confirm the model, price and installation location." },
    { title: "Delivery + fit", text: "Technician delivers and installs at your home." },
    { title: "Aftercare", text: "Filter changes and annual servicing on request." },
  ];
  return (
    <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-lg">How the installation visit works</h2>
      <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-xl border border-border bg-card p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {index + 1}
            </span>
            <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
