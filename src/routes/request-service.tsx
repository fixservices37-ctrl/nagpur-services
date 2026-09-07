import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { PageHeader } from "@/components/site/PageHeader";
import { RequestForm } from "@/components/site/RequestForm";
import { seo } from "@/lib/seo";
import { services } from "@/lib/services";

const searchSchema = z.object({
  service: z
    .enum(["Electrical", "Plumbing", "Carpenter", "RO / Water Filter", "Cleaning"])
    .optional(),
  /** Distinct customer intents. Right now only used for RO installations. */
  intent: z.enum(["installation"]).optional(),
  /** Brand name for RO installations, sanitised to keep the prefilled text safe. */
  brand: z
    .string()
    .trim()
    .max(80)
    .regex(/^[A-Za-z0-9 &.+-]*$/)
    .optional(),
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
  const { service, intent, brand } = Route.useSearch();

  const isInstallation = intent === "installation";
  const genericInstallationText = services.find((entry) => entry.value === service)?.installationCta
    ?.prefilledProblem;

  const installationProblem = isInstallation
    ? brand
      ? `I would like to install a new ${brand} RO / water purifier at my home in Nagpur. Please call to confirm the model, price and visit time.`
      : genericInstallationText
    : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Service request"
        title={isInstallation ? "Request a New Installation" : "Request a Service"}
        subtitle={
          isInstallation
            ? brand
              ? `Confirm your details and our team will call you to arrange the ${brand} installation.`
              : "Tell us where the installation is needed. Our team will call you to confirm the model, price and visit time."
            : "Fill in a few details about the problem. Our team will call you to confirm the work and the visit time — no account or online payment needed."
        }
      />
      <div className="container-page max-w-3xl py-8 sm:py-12 lg:py-14">
        <RequestForm initialService={service} initialProblem={installationProblem} />
      </div>
    </>
  );
}
