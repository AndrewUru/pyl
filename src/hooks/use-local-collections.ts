"use client";

import { useLiveQuery } from "dexie-react-hooks";

import {
  budgetsRepository,
  calculationsRepository,
  clientsRepository,
  projectsRepository,
  settingsRepository,
} from "@/lib/db";

export function useProjects() {
  const projects = useLiveQuery(() => projectsRepository.list(), []);
  return { projects: projects ?? [], isLoading: projects === undefined };
}

export function useClients() {
  const clients = useLiveQuery(() => clientsRepository.list(), []);
  return { clients: clients ?? [], isLoading: clients === undefined };
}

export function useBudgets() {
  const budgets = useLiveQuery(() => budgetsRepository.list(), []);
  return { budgets: budgets ?? [], isLoading: budgets === undefined };
}

export function useCalculations() {
  const calculations = useLiveQuery(
    () => calculationsRepository.list(),
    [],
  );
  return {
    calculations: calculations ?? [],
    isLoading: calculations === undefined,
  };
}

export function useSettings() {
  const settings = useLiveQuery(() => settingsRepository.list(), []);
  return { settings: settings ?? [], isLoading: settings === undefined };
}
