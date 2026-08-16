import "client-only";

import type {
  BudgetsRepository,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "@/features/budgets";
import type {
  CalculationsRepository,
  CreateCalculationInput,
  UpdateCalculationInput,
} from "@/features/calculations";
import type {
  ClientsRepository,
  CreateClientInput,
  UpdateClientInput,
} from "@/features/clients";
import type {
  CreateProjectInput,
  ProjectsRepository,
  UpdateProjectInput,
} from "@/features/projects";
import type {
  CreateSettingsInput,
  SettingsRepository,
  UpdateSettingsInput,
} from "@/features/settings";
import type {
  Budget,
  Calculation,
  Client,
  Project,
  Settings,
} from "@/types/entities";

import { createId } from "../id";
import { nowIso } from "../time";
import { createDexieRepository } from "./create-repository";

export const projectsRepository: ProjectsRepository = createDexieRepository<
  Project,
  CreateProjectInput,
  UpdateProjectInput
>(
  (database) => database.projects,
  (input) => {
    const timestamp = nowIso();
    return {
      ...input,
      id: createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  },
  (current, changes) => ({
    ...current,
    ...changes,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: nowIso(),
  }),
);

export const clientsRepository: ClientsRepository = createDexieRepository<
  Client,
  CreateClientInput,
  UpdateClientInput
>(
  (database) => database.clients,
  (input) => {
    const timestamp = nowIso();
    return {
      ...input,
      id: createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  },
  (current, changes) => ({
    ...current,
    ...changes,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: nowIso(),
  }),
);

export const budgetsRepository: BudgetsRepository = createDexieRepository<
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput
>(
  (database) => database.budgets,
  (input) => {
    const timestamp = nowIso();
    return {
      ...input,
      id: createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  },
  (current, changes) => ({
    ...current,
    ...changes,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: nowIso(),
  }),
);

export const calculationsRepository: CalculationsRepository =
  createDexieRepository<
    Calculation,
    CreateCalculationInput,
    UpdateCalculationInput
  >(
    (database) => database.calculations,
    (input) => ({
      ...input,
      id: createId(),
      createdAt: nowIso(),
    }),
    (current, changes) => ({
      ...current,
      ...changes,
      id: current.id,
      createdAt: current.createdAt,
    }),
  );

export const settingsRepository: SettingsRepository = createDexieRepository<
  Settings,
  CreateSettingsInput,
  UpdateSettingsInput
>(
  (database) => database.settings,
  (input) => ({
    ...input,
    id: createId(),
  }),
  (current, changes) => ({
    ...current,
    ...changes,
    id: current.id,
  }),
);

export const repositories = {
  projects: projectsRepository,
  clients: clientsRepository,
  budgets: budgetsRepository,
  calculations: calculationsRepository,
  settings: settingsRepository,
} as const;
