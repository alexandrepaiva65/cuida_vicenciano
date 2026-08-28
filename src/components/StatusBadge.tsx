import { cn } from "@/lib/utils";
import { STATUS_CONFIG, type ProblemaStatus } from "@/lib/status";

export function StatusBadge({
  status,
  className,
}: {
  status: ProblemaStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        config.badge,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
