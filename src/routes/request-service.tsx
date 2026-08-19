import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { PageHeader } from "@/components/site/PageHeader";
import { RequestForm } from "@/components/site/RequestForm";
import { seo } from "@/lib/seo";

const searchSchema = z.object({
  service: z.enum(["Electrical", "Plumbing", "Carpenter", "RO / Water Filter", "Cleaning"]).optional(),
});

export const Route = createFileRoute("/request-service")({
  validateSearch: searchSchema,
  head: () =>
    seo({
      title: "Request a Service — Home Repairs in Nagpur",
      description:
        "Submit a home service request in Nagpur for electrical, plumbing, carpentry or RO work. No account needed — our team calls you to confirm the visit.",
      path: "/request-service",
    }),
  component: RequestServicePage,
});

function RequestServicePage() {
  const { service } = Route.useSearch();

  return (
    <>
      <PageHeader
        eyebrow="Service request"
        title="Request a Service"
        subtitle="Fill in a few details about the problem. Our team will call you to confirm the work and the visit time — no account or online payment needed."
      />
      <div className="container-page max-w-3xl py-10 sm:py-14">
        <RequestForm initialService={service} />
      </div>
    </>
  );
}
