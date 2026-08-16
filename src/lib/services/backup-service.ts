import "client-only";

import type { Table } from "dexie";

import {
  MAX_BACKUP_FILE_SIZE_BYTES,
  PYL_BACKUP_APP,
  PYL_BACKUP_VERSION,
  createBackupSummary,
  type BackupImportMode,
  type BackupSummary,
  type BackupValidationResult,
  type PylBackupDocument,
} from "@/features/settings/backup/backup-types";
import { parseBackupJson } from "@/features/settings/backup/backup-validation";
import { getPylDatabase, isIndexedDbAvailable } from "@/lib/db";

export interface ParsedBackupFile {
  fileName: string;
  backup: PylBackupDocument;
  summary: BackupSummary;
}

function ensureIndexedDb(): void {
  if (!isIndexedDbAvailable()) {
    throw new Error(
      "El almacenamiento local no está disponible en este navegador.",
    );
  }
}

async function bulkPutIfPresent<TEntity>(
  table: Table<TEntity, string>,
  values: TEntity[],
): Promise<void> {
  if (values.length) {
    await table.bulkPut(values);
  }
}

export async function getLocalDataSummary(): Promise<BackupSummary> {
  ensureIndexedDb();
  const database = getPylDatabase();
  const counts = await database.transaction(
    "r",
    [
      database.projects,
      database.clients,
      database.budgets,
      database.calculations,
      database.settings,
    ],
    () =>
      Promise.all([
        database.projects.count(),
        database.clients.count(),
        database.budgets.count(),
        database.calculations.count(),
        database.settings.count(),
      ]),
  );

  return {
    projects: counts[0],
    clients: counts[1],
    budgets: counts[2],
    calculations: counts[3],
    settings: counts[4],
  };
}

export async function createLocalBackup(): Promise<PylBackupDocument> {
  ensureIndexedDb();
  const database = getPylDatabase();
  const [projects, clients, budgets, calculations, settings] =
    await database.transaction(
      "r",
      [
        database.projects,
        database.clients,
        database.budgets,
        database.calculations,
        database.settings,
      ],
      () =>
        Promise.all([
          database.projects.toArray(),
          database.clients.toArray(),
          database.budgets.toArray(),
          database.calculations.toArray(),
          database.settings.toArray(),
        ]),
    );

  return {
    version: PYL_BACKUP_VERSION,
    app: PYL_BACKUP_APP,
    exportedAt: new Date().toISOString(),
    data: { projects, clients, budgets, calculations, settings },
  };
}

export async function downloadLocalBackup(): Promise<BackupSummary> {
  const backup = await createLocalBackup();
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `pyl-backup-${backup.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  return createBackupSummary(backup.data);
}

export async function parseBackupFile(
  file: File,
): Promise<BackupValidationResult> {
  if (file.size > MAX_BACKUP_FILE_SIZE_BYTES) {
    return {
      success: false,
      errors: ["El archivo supera el límite permitido de 25 MB."],
    };
  }

  try {
    return parseBackupJson(await file.text());
  } catch {
    return {
      success: false,
      errors: ["No se ha podido leer el archivo seleccionado."],
    };
  }
}

export async function importLocalBackup(
  backup: PylBackupDocument,
  mode: BackupImportMode,
): Promise<void> {
  ensureIndexedDb();
  const database = getPylDatabase();

  await database.transaction(
    "rw",
    [
      database.projects,
      database.clients,
      database.budgets,
      database.calculations,
      database.settings,
    ],
    async () => {
      if (mode === "replace") {
        await Promise.all([
          database.projects.clear(),
          database.clients.clear(),
          database.budgets.clear(),
          database.calculations.clear(),
          database.settings.clear(),
        ]);
      }

      await bulkPutIfPresent(database.projects, backup.data.projects);
      await bulkPutIfPresent(database.clients, backup.data.clients);
      await bulkPutIfPresent(database.budgets, backup.data.budgets);
      await bulkPutIfPresent(database.calculations, backup.data.calculations);
      await bulkPutIfPresent(database.settings, backup.data.settings);
    },
  );
}

export async function clearAllLocalData(): Promise<void> {
  ensureIndexedDb();
  const database = getPylDatabase();
  await database.transaction(
    "rw",
    [
      database.projects,
      database.clients,
      database.budgets,
      database.calculations,
      database.settings,
    ],
    () =>
      Promise.all([
        database.projects.clear(),
        database.clients.clear(),
        database.budgets.clear(),
        database.calculations.clear(),
        database.settings.clear(),
      ]).then(() => undefined),
  );
}

export function toParsedBackupFile(
  fileName: string,
  result: BackupValidationResult,
): ParsedBackupFile | null {
  return result.success
    ? {
        fileName,
        backup: result.backup,
        summary: result.summary,
      }
    : null;
}
