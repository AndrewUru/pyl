import "client-only";

import Dexie, { type Table } from "dexie";

import type {
  Budget,
  Calculation,
  Client,
  Project,
  Settings,
} from "@/types/entities";

export const PYL_DATABASE_NAME = "pyl-db";
export const PYL_DATABASE_VERSION = 1;

export class PylDatabase extends Dexie {
  projects!: Table<Project, string>;
  clients!: Table<Client, string>;
  budgets!: Table<Budget, string>;
  calculations!: Table<Calculation, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super(PYL_DATABASE_NAME);

    this.version(PYL_DATABASE_VERSION).stores({
      projects: "id, clientId, status, createdAt, updatedAt",
      clients: "id, name, createdAt, updatedAt",
      budgets: "id, projectId, clientId, createdAt, updatedAt",
      calculations: "id, projectId, type, createdAt",
      settings: "id",
    });
  }
}

let database: PylDatabase | undefined;

export function isIndexedDbAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

export function getPylDatabase(): PylDatabase {
  if (!isIndexedDbAvailable()) {
    throw new Error("IndexedDB is only available in a supported browser.");
  }

  database ??= new PylDatabase();
  return database;
}

export function closePylDatabase(): void {
  database?.close();
  database = undefined;
}
