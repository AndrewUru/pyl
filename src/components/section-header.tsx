import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3.5 sm:px-5">
      <div>
        <h2 className="text-sm font-semibold tracking-[-0.01em] text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
