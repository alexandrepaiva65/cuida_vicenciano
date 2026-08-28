import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function StatCard({
  label,
  valor,
  icone,
  destaque,
  className,
}: {
  label: string;
  valor: number | string;
  icone?: ReactNode;
  destaque?: string | undefined;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icone ? <span className="text-muted-foreground">{icone}</span> : null}
      </div>
      <p className={cn("mt-3 text-3xl font-bold tracking-tight", destaque ?? "text-foreground")}>
        {valor}
      </p>
    </div>
  );
}
