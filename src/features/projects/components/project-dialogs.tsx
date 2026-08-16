"use client";

import { useId, useState, type FormEvent } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppDialog as Dialog } from "@/components/ui/dialog";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
} from "@/domain/projects";
import type { CreateProjectInput } from "@/features/projects";
import type { Client, Project } from "@/types/entities";

interface ProjectFormDialogProps {
  project?: Project;
  clients: Client[];
  onClose: () => void;
  onSubmit: (input: CreateProjectInput) => Promise<void>;
}

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-muted";

function isProjectStatus(value: string): value is ProjectStatus {
  return PROJECT_STATUSES.some((status) => status === value);
}

function getMutationError(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "No se ha podido guardar el proyecto.";
}

export function ProjectFormDialog({
  project,
  clients,
  onClose,
  onSubmit,
}: ProjectFormDialogProps) {
  const nameId = useId();
  const descriptionId = useId();
  const clientId = useId();
  const statusId = useId();
  const errorId = useId();
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [selectedClientId, setSelectedClientId] = useState(
    project?.clientId ?? "",
  );
  const [status, setStatus] = useState<ProjectStatus>(
    project?.status ?? "draft",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Escribe un nombre para el proyecto.");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        name,
        description,
        clientId: selectedClientId,
        status,
      });
    } catch (submitError: unknown) {
      setError(getMutationError(submitError));
      setIsSaving(false);
    }
  }

  function handleStatusChange(value: string) {
    if (isProjectStatus(value)) {
      setStatus(value);
    }
  }

  return (
    <Dialog
      title={project ? "Editar proyecto" : "Nuevo proyecto"}
      description={
        project
          ? "Actualiza la información general del proyecto."
          : "Crea un espacio de trabajo para agrupar mediciones y presupuestos."
      }
      onClose={isSaving ? () => undefined : onClose}
    >
      <form onSubmit={handleSubmit} aria-describedby={error ? errorId : undefined}>
        <div className="max-h-[calc(92dvh-9rem)] space-y-4 overflow-y-auto px-5 py-5">
          <div>
            <label htmlFor={nameId} className="text-xs font-medium text-foreground">
              Nombre <span aria-hidden="true" className="text-red-600">*</span>
            </label>
            <input
              id={nameId}
              data-autofocus
              required
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={`${fieldClassName} h-10`}
              placeholder="Ej. Reforma oficinas planta 2"
              disabled={isSaving}
            />
          </div>

          <div>
            <label
              htmlFor={descriptionId}
              className="text-xs font-medium text-foreground"
            >
              Descripción
            </label>
            <textarea
              id={descriptionId}
              rows={4}
              maxLength={600}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={`${fieldClassName} resize-y py-2.5`}
              placeholder="Alcance, ubicación o notas generales"
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={clientId}
                className="text-xs font-medium text-foreground"
              >
                Cliente
              </label>
              <select
                id={clientId}
                value={selectedClientId}
                onChange={(event) => setSelectedClientId(event.target.value)}
                className={`${fieldClassName} h-10`}
                disabled={isSaving}
              >
                <option value="">Sin cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}{client.company ? ` · ${client.company}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={statusId}
                className="text-xs font-medium text-foreground"
              >
                Estado
              </label>
              <select
                id={statusId}
                value={status}
                onChange={(event) => handleStatusChange(event.target.value)}
                className={`${fieldClassName} h-10`}
                disabled={isSaving}
              >
                {PROJECT_STATUSES.map((projectStatus) => (
                  <option key={projectStatus} value={projectStatus}>
                    {PROJECT_STATUS_LABELS[projectStatus]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <p
              id={errorId}
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-border bg-surface-muted/50 px-5 py-4">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={isSaving}>
            {isSaving ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : null}
            {project ? "Guardar cambios" : "Crear proyecto"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

interface DeleteProjectDialogProps {
  project: Project;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteProjectDialog({
  project,
  onClose,
  onConfirm,
}: DeleteProjectDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (deleteError: unknown) {
      setError(getMutationError(deleteError));
      setIsDeleting(false);
    }
  }

  return (
    <Dialog
      title="Eliminar proyecto"
      description="Esta acción elimina los datos generales del proyecto de este dispositivo."
      onClose={isDeleting ? () => undefined : onClose}
      panelClassName="sm:max-w-md"
    >
      <div className="px-5 py-5">
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
            <Trash2 aria-hidden="true" className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-red-950">{project.name}</p>
            <p className="mt-1 text-xs leading-5 text-red-800">
              Confirma que quieres eliminar este proyecto. Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-xs text-red-700">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex justify-end gap-2 border-t border-border bg-surface-muted/50 px-5 py-4">
        <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
          Cancelar
        </Button>
        <Button
          variant="destructive"
          onClick={handleConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Trash2 aria-hidden="true" className="size-4" />
          )}
          Eliminar proyecto
        </Button>
      </div>
    </Dialog>
  );
}
