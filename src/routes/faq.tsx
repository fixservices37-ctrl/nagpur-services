import { createFileRoute, Link } from "@tanstack/react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { seo } from "@/lib/seo";
import { faqs } from "@/lib/services";

export const Route = createFileRoute("/faq")({
  head: () => ({
    ...seo({
      title: "FAQ — Home Maintenance Services in Nagpur",
      description:
        "Answers about booking home repairs in Nagpur: accounts, service areas, uploading photos, confirming appointments and how visits are scheduled.",
      path: "/faq",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Questions"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know before requesting a home maintenance visit."
      />
      <Section className="max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Button variant="accent" size="lg" className="mt-8" asChild>
          <Link to="/request-service">Request a Service</Link>
        </Button>
      </Section>
    </>
  );
}
