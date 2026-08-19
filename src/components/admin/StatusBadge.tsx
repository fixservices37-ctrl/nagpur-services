import { STATUS_STYLES, isRequestStatus } from "@/lib/admin";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string | undefined;
}) {
  const style = isRequestStatus(status) ? STATUS_STYLES[status] : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        style,
        className,
      )}
    >
      {status}
    </span>
  );
}
