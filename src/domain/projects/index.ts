export const PROJECT_STATUSES = [
  "draft",
  "active",
  "completed",
  "archived",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Borrador",
  active: "Activo",
  completed: "Completado",
  archived: "Archivado",
};

export interface ProjectDetailsInput {
  name: string;
  description?: string;
  clientId?: string;
  status: ProjectStatus;
}

export function normalizeProjectDetails(
  input: ProjectDetailsInput,
): ProjectDetailsInput {
  const name = input.name.trim();

  if (!name) {
    throw new Error("El nombre del proyecto es obligatorio.");
  }

  const description = input.description?.trim();
  const clientId = input.clientId?.trim();

  return {
    name,
    status: input.status,
    ...(description ? { description } : {}),
    ...(clientId ? { clientId } : {}),
  };
}

export function createProjectCopyName(name: string): string {
  return `${name.trim()} (copia)`;
}
