import {
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
} from "@/domain/projects";
import { cn } from "@/lib/utils";

const statusClasses: Record<ProjectStatus, string> = {
  draft: "border-zinc-200 bg-zinc-50 text-zinc-600",
  active: "border-blue-200 bg-blue-50 text-blue-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived: "border-amber-200 bg-amber-50 text-amber-700",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        statusClasses[status],
      )}
    >
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}
