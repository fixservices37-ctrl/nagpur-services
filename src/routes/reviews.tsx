import { createFileRoute, Link } from "@tanstack/react-router";
import { Quote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { seo } from "@/lib/seo";
import { placeholderReviews } from "@/lib/services";

export const Route = createFileRoute("/reviews")({
  head: () =>
    seo({
      title: "Reviews — Customer Feedback for Our Nagpur Home Services",
      description:
        "Customer feedback about our home maintenance work in Nagpur. Reviews are collected directly from customers after a completed visit.",
      path: "/reviews",
    }),
  component: ReviewsPage,
});

function ReviewsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Feedback"
        title="Reviews"
        subtitle="Real reviews will be published here as customers share them after completed visits."
      />
      <Section>
        <div className="rounded-xl border border-accent/40 bg-accent/15 p-4 text-sm text-foreground">
          The reviews below are clearly-marked placeholders. They are not real customer
          testimonials and should be replaced with genuine feedback in{" "}
          <code className="rounded bg-background px-1 py-0.5 text-xs">src/lib/services.ts</code>.
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {placeholderReviews.map((review, i) => (
            <figure key={i} className="rounded-2xl border border-border bg-card p-6">
              <Quote className="h-6 w-6 text-primary" />
              <blockquote className="mt-3 text-sm text-muted-foreground">{review.text}</blockquote>
              <figcaption className="mt-4 border-t border-border pt-4 text-sm">
                <span className="block font-semibold text-foreground">{review.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {review.service} • {review.area}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <Button variant="accent" size="lg" className="mt-8" asChild>
          <Link to="/request-service">Request a Service</Link>
        </Button>
      </Section>
    </>
  );
}
