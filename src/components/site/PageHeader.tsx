import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="container-page py-12 sm:py-16">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">{eyebrow}</p>
        )}
        <h1 className="mt-2 text-3xl text-foreground sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-base text-muted-foreground">{subtitle}</p>}
      </div>
    </section>
  );
}

export function Section({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`container-page py-12 sm:py-16 ${className}`}>{children}</section>;
}
