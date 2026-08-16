import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  helper: string;
  icon: LucideIcon;
  isLoading?: boolean;
}

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  isLoading = false,
}: StatCardProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className="flex size-7 items-center justify-center rounded-md border border-border bg-surface-muted text-muted-foreground">
          <Icon aria-hidden="true" className="size-3.5" />
        </span>
      </div>
      {isLoading ? (
        <div className="mt-4 h-8 w-16 animate-pulse rounded-md bg-surface-muted" />
      ) : (
        <p className="mt-3 font-mono text-2xl font-semibold tracking-[-0.04em] text-foreground">
          {value}
        </p>
      )}
      <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
        {helper}
      </p>
    </article>
  );
}
