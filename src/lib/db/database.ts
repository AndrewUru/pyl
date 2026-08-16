import "client-only";

import Dexie, { type Table } from "dexie";

import type { ProjectStatus } from "@/domain/projects";
import type {
  Budget,
  Calculation,
  Client,
  Project,
  Settings,
} from "@/types/entities";

export const PYL_DATABASE_NAME = "pyl-db";
export const PYL_DATABASE_VERSION = 2;

type LegacyProjectStatus = "pending" | "in_progress" | "delivered";

interface LegacyProjectRecord extends Omit<Project, "status"> {
  status: ProjectStatus | LegacyProjectStatus;
}

const databaseStores = {
  projects: "id, clientId, status, createdAt, updatedAt",
  clients: "id, name, createdAt, updatedAt",
  budgets: "id, projectId, clientId, createdAt, updatedAt",
  calculations: "id, projectId, type, createdAt",
  settings: "id",
} as const;

function migrateProjectStatus(
  status: LegacyProjectRecord["status"],
): ProjectStatus {
  switch (status) {
    case "pending":
      return "draft";
    case "in_progress":
      return "active";
    case "delivered":
      return "completed";
    default:
      return status;
  }
}

export class PylDatabase extends Dexie {
  projects!: Table<Project, string>;
  clients!: Table<Client, string>;
  budgets!: Table<Budget, string>;
  calculations!: Table<Calculation, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super(PYL_DATABASE_NAME);

    this.version(1).stores(databaseStores);
    this.version(PYL_DATABASE_VERSION).stores(databaseStores).upgrade((tx) => {
      return tx
        .table<LegacyProjectRecord, string>("projects")
        .toCollection()
        .modify((project) => {
          project.status = migrateProjectStatus(project.status);
        });
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
