import {
  createProjectCopyName,
  normalizeProjectDetails,
} from "@/domain/projects";
import type { Project } from "@/types/entities";

import type {
  CreateProjectInput,
  ProjectsRepository,
  UpdateProjectInput,
} from ".";

export interface ProjectsService {
  list(): Promise<Project[]>;
  getById(id: string): Promise<Project | undefined>;
  create(input: CreateProjectInput): Promise<Project>;
  update(id: string, input: UpdateProjectInput): Promise<Project>;
  delete(id: string): Promise<void>;
  duplicate(id: string): Promise<Project>;
}

export function createProjectsService(
  repository: ProjectsRepository,
): ProjectsService {
  return {
    async list() {
      const projects = await repository.list();
      return projects.sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      );
    },
    getById: (id) => repository.getById(id),
    create: (input) => repository.create(normalizeProjectDetails(input)),
    async update(id, input) {
      const current = await repository.getById(id);

      if (!current) {
        throw new Error("El proyecto ya no existe en este dispositivo.");
      }

      const normalized = normalizeProjectDetails({
          name: input.name ?? current.name,
          description:
            input.description === undefined
              ? current.description
              : input.description,
          clientId:
            input.clientId === undefined ? current.clientId : input.clientId,
          status: input.status ?? current.status,
        });

      return repository.update(id, {
        ...normalized,
        description: normalized.description,
        clientId: normalized.clientId,
      });
    },
    delete: (id) => repository.delete(id),
    async duplicate(id) {
      const project = await repository.getById(id);

      if (!project) {
        throw new Error("El proyecto ya no existe en este dispositivo.");
      }

      return repository.create({
        name: createProjectCopyName(project.name),
        status: "draft",
        ...(project.description ? { description: project.description } : {}),
        ...(project.clientId ? { clientId: project.clientId } : {}),
      });
    },
  };
}
