import "client-only";

import { createProjectsService } from "@/features/projects/project-service";
import { projectsRepository } from "@/lib/db";

export const projectsService = createProjectsService(projectsRepository);
