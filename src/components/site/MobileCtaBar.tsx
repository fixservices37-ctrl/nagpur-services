import { Link } from "@tanstack/react-router";
import { MessageCircle, Phone, Wrench } from "lucide-react";

import { telHref, whatsappHref } from "@/lib/business";

/** Sticky call / WhatsApp / request bar shown only on small screens. */
export function MobileCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-3">
        <a
          href={telHref}
          className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-foreground"
        >
          <Phone className="h-5 w-5 text-primary" />
          Call
        </a>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-14 flex-col items-center justify-center gap-0.5 border-x border-border text-xs font-semibold text-foreground"
        >
          <MessageCircle className="h-5 w-5 text-whatsapp" />
          WhatsApp
        </a>
        <Link
          to="/request-service"
          className="flex min-h-14 flex-col items-center justify-center gap-0.5 bg-accent text-xs font-bold text-accent-foreground"
        >
          <Wrench className="h-5 w-5" />
          Request
        </Link>
      </div>
    </div>
  );
}
