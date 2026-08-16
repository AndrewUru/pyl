"use client";

import { useLiveQuery } from "dexie-react-hooks";

import {
  budgetsRepository,
  calculationsRepository,
  clientsRepository,
  settingsRepository,
} from "@/lib/db";
import { isIndexedDbAvailable } from "@/lib/db";
import { projectsService } from "@/lib/services/projects-service";
import type {
  Budget,
  Calculation,
  Client,
  Project,
  Settings,
} from "@/types/entities";

interface LocalQueryResult<T> {
  data: T;
  error: string | null;
}

const indexedDbUnavailableMessage =
  "El almacenamiento local no está disponible en este navegador.";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "No se han podido leer los datos guardados en este dispositivo.";
}

async function runLocalQuery<T>(
  query: () => Promise<T>,
  fallback: T,
): Promise<LocalQueryResult<T>> {
  if (!isIndexedDbAvailable()) {
    return { data: fallback, error: indexedDbUnavailableMessage };
  }

  try {
    return { data: await query(), error: null };
  } catch (error: unknown) {
    return { data: fallback, error: getErrorMessage(error) };
  }
}

export function useProjects() {
  const result = useLiveQuery(
    () => runLocalQuery(() => projectsService.list(), [] as Project[]),
    [],
  );
  return {
    projects: result?.data ?? [],
    isLoading: result === undefined,
    error: result?.error ?? null,
  };
}

export function useProject(projectId: string) {
  const result = useLiveQuery(
    () =>
      runLocalQuery(
        () => projectsService.getById(projectId),
        undefined as Project | undefined,
      ),
    [projectId],
  );
  return {
    project: result?.data,
    isLoading: result === undefined,
    error: result?.error ?? null,
  };
}

export function useClients() {
  const result = useLiveQuery(
    () => runLocalQuery(() => clientsRepository.list(), [] as Client[]),
    [],
  );
  return {
    clients: result?.data ?? [],
    isLoading: result === undefined,
    error: result?.error ?? null,
  };
}

export function useBudgets() {
  const result = useLiveQuery(
    () => runLocalQuery(() => budgetsRepository.list(), [] as Budget[]),
    [],
  );
  return {
    budgets: result?.data ?? [],
    isLoading: result === undefined,
    error: result?.error ?? null,
  };
}

export function useCalculations() {
  const result = useLiveQuery(
    () =>
      runLocalQuery(
        () => calculationsRepository.list(),
        [] as Calculation[],
      ),
    [],
  );
  return {
    calculations: result?.data ?? [],
    isLoading: result === undefined,
    error: result?.error ?? null,
  };
}

export function useSettings() {
  const result = useLiveQuery(
    () => runLocalQuery(() => settingsRepository.list(), [] as Settings[]),
    [],
  );
  return {
    settings: result?.data ?? [],
    isLoading: result === undefined,
    error: result?.error ?? null,
  };
}
