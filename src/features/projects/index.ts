import type { Project } from "@/types/entities";
import type { Repository } from "@/types/repository";

export type CreateProjectInput = Omit<
  Project,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateProjectInput = Partial<CreateProjectInput>;

export type ProjectsRepository = Repository<
  Project,
  CreateProjectInput,
  UpdateProjectInput
>;
