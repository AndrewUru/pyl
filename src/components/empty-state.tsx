import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-5 text-center",
        compact ? "min-h-36 py-5" : "min-h-72 py-10",
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface-muted text-muted-foreground shadow-xs">
        <Icon aria-hidden="true" className="size-[18px]" />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
