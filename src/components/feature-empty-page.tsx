import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

interface FeatureEmptyPageProps {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  icon: LucideIcon;
}

export function FeatureEmptyPage({
  title,
  description,
  emptyTitle,
  emptyDescription,
  icon,
}: FeatureEmptyPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} eyebrow="Workspace" />
      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-panel">
        <EmptyState
          icon={icon}
          title={emptyTitle}
          description={emptyDescription}
        />
      </section>
    </div>
  );
}
