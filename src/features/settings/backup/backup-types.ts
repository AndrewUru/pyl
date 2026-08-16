import type {
  Budget,
  Calculation,
  Client,
  Project,
  Settings,
} from "@/types/entities";

export const PYL_BACKUP_APP = "PYL";
export const PYL_BACKUP_VERSION = 1;
export const MAX_BACKUP_FILE_SIZE_BYTES = 25 * 1024 * 1024;

export interface PylBackupData {
  projects: Project[];
  clients: Client[];
  budgets: Budget[];
  calculations: Calculation[];
  settings: Settings[];
}

export interface PylBackupDocument {
  version: typeof PYL_BACKUP_VERSION;
  app: typeof PYL_BACKUP_APP;
  exportedAt: string;
  data: PylBackupData;
}

export interface BackupSummary {
  projects: number;
  clients: number;
  budgets: number;
  calculations: number;
  settings: number;
}

export type BackupImportMode = "merge" | "replace";

export type BackupValidationResult =
  | {
      success: true;
      backup: PylBackupDocument;
      summary: BackupSummary;
    }
  | {
      success: false;
      errors: string[];
    };

export function createBackupSummary(data: PylBackupData): BackupSummary {
  return {
    projects: data.projects.length,
    clients: data.clients.length,
    budgets: data.budgets.length,
    calculations: data.calculations.length,
    settings: data.settings.length,
  };
}
