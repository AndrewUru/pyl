"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  ArchiveRestore,
  CheckCircle2,
  Database,
  Download,
  FileJson,
  HardDrive,
  LoaderCircle,
  ShieldCheck,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { AppDialog as Dialog } from "@/components/ui/dialog";
import type {
  BackupImportMode,
  BackupSummary,
} from "@/features/settings/backup/backup-types";
import {
  clearAllLocalData,
  downloadLocalBackup,
  getLocalDataSummary,
  importLocalBackup,
  parseBackupFile,
  type ParsedBackupFile,
} from "@/lib/services/backup-service";
import { cn } from "@/lib/utils";

interface FeedbackMessage {
  kind: "success" | "error";
  message: string;
}

type ActiveDialog = "import" | "clear" | null;

const emptySummary: BackupSummary = {
  projects: 0,
  clients: 0,
  budgets: 0,
  calculations: 0,
  settings: 0,
};

const summaryItems = [
  { key: "projects", label: "Proyectos" },
  { key: "clients", label: "Clientes" },
  { key: "budgets", label: "Presupuestos" },
  { key: "calculations", label: "Cálculos" },
  { key: "settings", label: "Configuraciones" },
] as const;

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "No se ha podido completar la operación.";
}

function DataSummary({
  summary,
  isLoading = false,
  compact = false,
}: {
  summary: BackupSummary;
  isLoading?: boolean;
  compact?: boolean;
}) {
  return (
    <dl
      className={cn(
        "grid gap-px overflow-hidden rounded-lg border border-border bg-border",
        compact ? "grid-cols-2 sm:grid-cols-5" : "grid-cols-2 lg:grid-cols-5",
      )}
    >
      {summaryItems.map((item) => (
        <div key={item.key} className="min-w-0 bg-surface px-3 py-3.5">
          <dt className="truncate text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            {item.label}
          </dt>
          <dd className="mt-1 font-mono text-lg font-semibold text-foreground">
            {isLoading ? (
              <span className="block h-6 w-8 animate-pulse rounded bg-surface-muted" />
            ) : (
              summary[item.key]
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ImportConfirmationDialog({
  candidate,
  mode,
  isImporting,
  onClose,
  onConfirm,
}: {
  candidate: ParsedBackupFile;
  mode: BackupImportMode;
  isImporting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isReplace = mode === "replace";
  return (
    <Dialog
      title="Confirmar importación"
      description={
        isReplace
          ? "Los datos actuales se eliminarán y serán sustituidos por esta copia."
          : "La copia se combinará con los datos guardados en este dispositivo."
      }
      onClose={isImporting ? () => undefined : onClose}
      panelClassName="sm:max-w-xl"
    >
      <div className="space-y-4 px-5 py-5">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted/45 px-3.5 py-3">
          <FileJson aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {candidate.fileName}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Backup validado · versión {candidate.backup.version}
            </p>
          </div>
        </div>
        <DataSummary summary={candidate.summary} compact />
        <div
          className={cn(
            "rounded-lg border px-3.5 py-3 text-xs leading-5",
            isReplace
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-blue-200 bg-blue-50 text-blue-800",
          )}
        >
          {isReplace
            ? "Esta acción borrará primero todos los datos locales actuales. No cierres la pestaña durante la importación."
            : "Los registros con el mismo ID se actualizarán con la versión de la copia; el resto se conservará."}
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-border bg-surface-muted/45 px-5 py-4">
        <Button variant="ghost" onClick={onClose} disabled={isImporting}>
          Cancelar
        </Button>
        <Button
          variant={isReplace ? "destructive" : "primary"}
          onClick={onConfirm}
          disabled={isImporting}
        >
          {isImporting ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <ArchiveRestore aria-hidden="true" className="size-4" />
          )}
          {isReplace ? "Reemplazar e importar" : "Fusionar datos"}
        </Button>
      </div>
    </Dialog>
  );
}

function ClearDataDialog({
  confirmation,
  isClearing,
  onConfirmationChange,
  onClose,
  onConfirm,
}: {
  confirmation: string;
  isClearing: boolean;
  onConfirmationChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const canClear = confirmation === "BORRAR";
  return (
    <Dialog
      title="Borrar todos los datos locales"
      description="Esta acción elimina proyectos, clientes, presupuestos, cálculos y configuraciones de este dispositivo."
      onClose={isClearing ? () => undefined : onClose}
      panelClassName="sm:max-w-md"
    >
      <div className="space-y-4 px-5 py-5">
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-red-900">
          <Trash2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p className="text-xs leading-5">
            Esta acción no se puede deshacer. Exporta antes una copia si quieres conservar la información.
          </p>
        </div>
        <div>
          <label htmlFor="clear-data-confirmation" className="text-xs font-medium text-foreground">
            Escribe <span className="font-mono font-semibold">BORRAR</span> para confirmar
          </label>
          <input
            id="clear-data-confirmation"
            data-autofocus
            autoComplete="off"
            value={confirmation}
            onChange={(event) => onConfirmationChange(event.target.value)}
            disabled={isClearing}
            className="mt-1.5 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 font-mono text-sm text-foreground outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-border bg-surface-muted/45 px-5 py-4">
        <Button variant="ghost" onClick={onClose} disabled={isClearing}>
          Cancelar
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={!canClear || isClearing}
        >
          {isClearing ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Trash2 aria-hidden="true" className="size-4" />
          )}
          Borrar definitivamente
        </Button>
      </div>
    </Dialog>
  );
}

export function BackupSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentSummary, setCurrentSummary] = useState(emptySummary);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [candidate, setCandidate] = useState<ParsedBackupFile | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<BackupImportMode>("merge");
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [clearConfirmation, setClearConfirmation] = useState("");
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  async function refreshSummary() {
    try {
      setCurrentSummary(await getLocalDataSummary());
      setStorageError(null);
    } catch (error: unknown) {
      setStorageError(getErrorMessage(error));
    } finally {
      setIsSummaryLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;
    getLocalDataSummary()
      .then((summary) => {
        if (isActive) {
          setCurrentSummary(summary);
          setStorageError(null);
        }
      })
      .catch((error: unknown) => {
        if (isActive) setStorageError(getErrorMessage(error));
      })
      .finally(() => {
        if (isActive) setIsSummaryLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  async function handleExport() {
    setIsExporting(true);
    setFeedback(null);
    try {
      await downloadLocalBackup();
      setFeedback({
        kind: "success",
        message: "Copia de seguridad exportada correctamente.",
      });
    } catch (error: unknown) {
      setFeedback({ kind: "error", message: getErrorMessage(error) });
    } finally {
      setIsExporting(false);
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsParsing(true);
    setCandidate(null);
    setValidationErrors([]);
    setFeedback(null);
    const result = await parseBackupFile(file);
    if (result.success) {
      setCandidate({
        fileName: file.name,
        backup: result.backup,
        summary: result.summary,
      });
    } else {
      setValidationErrors(result.errors);
    }
    setIsParsing(false);
  }

  async function handleImport() {
    if (!candidate) return;
    setIsImporting(true);
    setFeedback(null);
    try {
      await importLocalBackup(candidate.backup, importMode);
      setActiveDialog(null);
      setCandidate(null);
      setValidationErrors([]);
      await refreshSummary();
      setFeedback({
        kind: "success",
        message:
          importMode === "replace"
            ? "Los datos locales se han reemplazado por la copia seleccionada."
            : "La copia se ha fusionado con los datos locales.",
      });
    } catch (error: unknown) {
      setFeedback({ kind: "error", message: getErrorMessage(error) });
    } finally {
      setIsImporting(false);
    }
  }

  async function handleClear() {
    if (clearConfirmation !== "BORRAR") return;
    setIsClearing(true);
    setFeedback(null);
    try {
      await clearAllLocalData();
      setActiveDialog(null);
      setClearConfirmation("");
      setCandidate(null);
      await refreshSummary();
      setFeedback({
        kind: "success",
        message: "Todos los datos locales se han eliminado.",
      });
    } catch (error: unknown) {
      setFeedback({ kind: "error", message: getErrorMessage(error) });
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Configuración"
        description="Gestiona los datos y preferencias almacenados en este dispositivo."
      />

      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3.5 text-blue-950">
        <HardDrive aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="text-sm font-medium">Tus datos se almacenan únicamente en este dispositivo.</p>
          <p className="mt-0.5 text-xs leading-5 text-blue-800">
            Las copias de seguridad permiten mover tus proyectos a otro ordenador o recuperar los datos si borras el almacenamiento del navegador.
          </p>
        </div>
      </div>

      {storageError ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-amber-900">
          <XCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">Almacenamiento local no disponible</p>
            <p className="mt-0.5 text-xs leading-5 text-amber-800">{storageError}</p>
          </div>
        </div>
      ) : null}

      {feedback ? (
        <div
          role={feedback.kind === "error" ? "alert" : "status"}
          className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
            feedback.kind === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800",
          )}
        >
          {feedback.kind === "error" ? (
            <XCircle aria-hidden="true" className="size-4 shrink-0" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-panel">
        <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-muted-foreground">
            <Database aria-hidden="true" className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Datos y copias de seguridad</h2>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Exporta una copia completa o restaura información desde un archivo JSON de PYL.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-4 sm:p-5">
          <div>
            <h3 className="text-xs font-semibold text-foreground">Datos actuales</h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Contenido guardado en IndexedDB en este navegador.</p>
          </div>
          <DataSummary summary={currentSummary} isLoading={isSummaryLoading} />

          <div className="grid gap-4 border-t border-border pt-5 lg:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <Download aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium text-foreground">Exportar copia</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Descarga proyectos, clientes, presupuestos, cálculos y configuraciones en un único JSON.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={handleExport}
                disabled={isExporting || Boolean(storageError)}
              >
                {isExporting ? (
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <Download aria-hidden="true" className="size-4" />
                )}
                Exportar todos los datos
              </Button>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <Upload aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium text-foreground">Importar copia</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Selecciona un backup de PYL. El archivo se validará antes de mostrar cualquier opción.
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="sr-only"
                aria-label="Seleccionar copia de seguridad JSON"
                onChange={handleFileChange}
              />
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsing || Boolean(storageError)}
              >
                {isParsing ? (
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <FileJson aria-hidden="true" className="size-4" />
                )}
                Seleccionar backup
              </Button>
            </div>
          </div>

          {validationErrors.length ? (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
              <div className="flex items-center gap-2 text-sm font-medium">
                <XCircle aria-hidden="true" className="size-4" />
                El backup no es válido
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-red-800">
                {validationErrors.map((error, index) => (
                  <li key={`${index}-${error}`}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {candidate ? (
            <div className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50/45 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-emerald-700" />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-emerald-950">Backup válido</h3>
                  <p className="mt-0.5 truncate text-xs text-emerald-800">{candidate.fileName}</p>
                </div>
              </div>
              <DataSummary summary={candidate.summary} />

              <fieldset>
                <legend className="text-xs font-semibold text-foreground">Importar datos</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {([
                    {
                      value: "merge" as const,
                      title: "Fusionar con los datos actuales",
                      description: "Conserva los registros que no estén en la copia.",
                    },
                    {
                      value: "replace" as const,
                      title: "Reemplazar todos los datos actuales",
                      description: "Vacía primero el almacenamiento local.",
                    },
                  ]).map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-lg border bg-surface p-3 transition-colors",
                        importMode === option.value
                          ? "border-primary ring-2 ring-primary/10"
                          : "border-border hover:border-border-strong",
                      )}
                    >
                      <input
                        type="radio"
                        name="import-mode"
                        value={option.value}
                        checked={importMode === option.value}
                        onChange={() => setImportMode(option.value)}
                        className="mt-0.5 accent-primary"
                      />
                      <span>
                        <span className="block text-xs font-medium text-foreground">{option.title}</span>
                        <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">{option.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex justify-end">
                <Button variant="primary" onClick={() => setActiveDialog("import")}>
                  <ArchiveRestore aria-hidden="true" className="size-4" />
                  Importar datos
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-red-200 bg-surface shadow-panel">
        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <Trash2 aria-hidden="true" className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Borrar todos los datos locales</h2>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                Elimina permanentemente toda la información de PYL de este navegador.
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              setClearConfirmation("");
              setActiveDialog("clear");
            }}
            disabled={Boolean(storageError)}
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Borrar datos
          </Button>
        </div>
      </section>

      {activeDialog === "import" && candidate ? (
        <ImportConfirmationDialog
          candidate={candidate}
          mode={importMode}
          isImporting={isImporting}
          onClose={() => setActiveDialog(null)}
          onConfirm={handleImport}
        />
      ) : null}
      {activeDialog === "clear" ? (
        <ClearDataDialog
          confirmation={clearConfirmation}
          isClearing={isClearing}
          onConfirmationChange={setClearConfirmation}
          onClose={() => setActiveDialog(null)}
          onConfirm={handleClear}
        />
      ) : null}
    </div>
  );
}
