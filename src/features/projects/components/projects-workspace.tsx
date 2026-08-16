"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Copy,
  DatabaseZap,
  FolderKanban,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
} from "@/domain/projects";
import type { CreateProjectInput } from "@/features/projects";
import {
  DeleteProjectDialog,
  ProjectFormDialog,
} from "@/features/projects/components/project-dialogs";
import { ProjectStatusBadge } from "@/features/projects/components/project-status-badge";
import { useClients, useProjects } from "@/hooks/use-local-collections";
import { projectsService } from "@/lib/services/projects-service";
import type { Project } from "@/types/entities";

type StatusFilter = "all" | ProjectStatus;
type ProjectDialogState =
  | { type: "create" }
  | { type: "edit"; project: Project }
  | { type: "delete"; project: Project }
  | null;

interface ToastMessage {
  kind: "success" | "error";
  message: string;
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Sin fecha" : dateFormatter.format(date);
}

function getActionError(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "No se ha podido completar la operación.";
}

function isStatusFilter(value: string): value is StatusFilter {
  return (
    value === "all" || PROJECT_STATUSES.some((status) => status === value)
  );
}

function ProjectListSkeleton() {
  return (
    <div aria-label="Cargando proyectos" className="divide-y divide-border">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex items-center gap-4 px-4 py-4 sm:px-5">
          <span className="size-9 animate-pulse rounded-lg bg-surface-muted" />
          <div className="flex-1 space-y-2">
            <span className="block h-3 w-44 animate-pulse rounded bg-surface-muted" />
            <span className="block h-2.5 w-28 animate-pulse rounded bg-surface-muted" />
          </div>
          <span className="hidden h-6 w-20 animate-pulse rounded-full bg-surface-muted sm:block" />
        </div>
      ))}
    </div>
  );
}

export function ProjectsWorkspace() {
  const { projects, isLoading, error: projectsError } = useProjects();
  const { clients, error: clientsError } = useClients();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dialog, setDialog] = useState<ProjectDialogState>(null);
  const [busyProjectId, setBusyProjectId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const clientNames = useMemo(
    () => new Map(clients.map((client) => [client.id, client.name])),
    [clients],
  );

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");

    return projects.filter((project) => {
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      const clientName = project.clientId
        ? clientNames.get(project.clientId) ?? ""
        : "";
      const matchesQuery =
        !normalizedQuery ||
        project.name.toLocaleLowerCase("es").includes(normalizedQuery) ||
        project.description
          ?.toLocaleLowerCase("es")
          .includes(normalizedQuery) ||
        clientName.toLocaleLowerCase("es").includes(normalizedQuery);

      return matchesStatus && Boolean(matchesQuery);
    });
  }, [clientNames, projects, query, statusFilter]);

  const storageError = projectsError ?? clientsError;
  const hasFilters = query.trim().length > 0 || statusFilter !== "all";

  async function handleCreate(input: CreateProjectInput) {
    await projectsService.create(input);
    setDialog(null);
    setToast({ kind: "success", message: "Proyecto creado correctamente." });
  }

  async function handleUpdate(project: Project, input: CreateProjectInput) {
    await projectsService.update(project.id, input);
    setDialog(null);
    setToast({ kind: "success", message: "Cambios guardados." });
  }

  async function handleDuplicate(project: Project) {
    setBusyProjectId(project.id);
    try {
      await projectsService.duplicate(project.id);
      setToast({ kind: "success", message: "Proyecto duplicado como borrador." });
    } catch (error: unknown) {
      setToast({ kind: "error", message: getActionError(error) });
    } finally {
      setBusyProjectId(null);
    }
  }

  async function handleDelete(project: Project) {
    await projectsService.delete(project.id);
    setDialog(null);
    setToast({ kind: "success", message: "Proyecto eliminado." });
  }

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
  }

  function renderProjectActions(project: Project) {
    const isBusy = busyProjectId === project.id;

    return (
      <div className="flex items-center justify-end gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Editar ${project.name}`}
          title="Editar proyecto"
          onClick={() => setDialog({ type: "edit", project })}
        >
          <Pencil aria-hidden="true" className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Duplicar ${project.name}`}
          title="Duplicar proyecto"
          disabled={isBusy}
          onClick={() => handleDuplicate(project)}
        >
          {isBusy ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Copy aria-hidden="true" className="size-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Eliminar ${project.name}`}
          title="Eliminar proyecto"
          className="hover:bg-red-50 hover:text-red-700"
          onClick={() => setDialog({ type: "delete", project })}
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gestión"
        title="Proyectos"
        description="Organiza obras, clientes, mediciones y documentación técnica desde este dispositivo."
        actions={
          <Button
            variant="primary"
            onClick={() => setDialog({ type: "create" })}
            disabled={Boolean(storageError)}
          >
            <Plus aria-hidden="true" className="size-4" />
            Nuevo proyecto
          </Button>
        }
      />

      {storageError ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-amber-950"
        >
          <DatabaseZap aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">Almacenamiento local no disponible</p>
            <p className="mt-0.5 text-xs leading-5 text-amber-800">
              {storageError} Comprueba los permisos del navegador o desactiva el modo privado.
            </p>
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-panel">
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por proyecto, cliente o descripción"
              aria-label="Buscar proyectos"
              className="h-9 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="project-status-filter" className="sr-only">
              Filtrar por estado
            </label>
            <select
              id="project-status-filter"
              value={statusFilter}
              onChange={(event) => {
                if (isStatusFilter(event.target.value)) {
                  setStatusFilter(event.target.value);
                }
              }}
              className="h-9 min-w-36 flex-1 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 sm:flex-none"
            >
              <option value="all">Todos los estados</option>
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {PROJECT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <span className="hidden whitespace-nowrap text-xs text-muted-foreground sm:inline">
              {filteredProjects.length} de {projects.length}
            </span>
          </div>
        </div>

        {isLoading ? (
          <ProjectListSkeleton />
        ) : filteredProjects.length ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/45 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    <th scope="col" className="px-5 py-2.5">Proyecto</th>
                    <th scope="col" className="px-4 py-2.5">Cliente</th>
                    <th scope="col" className="px-4 py-2.5">Estado</th>
                    <th scope="col" className="px-4 py-2.5">Actualizado</th>
                    <th scope="col" className="w-32 px-4 py-2.5">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="group hover:bg-surface-muted/35">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/proyectos/${project.id}`}
                          className="group/link flex min-w-0 items-center gap-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-muted-foreground">
                            <FolderKanban aria-hidden="true" className="size-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block max-w-sm truncate text-sm font-medium text-foreground group-hover/link:text-primary">
                              {project.name}
                            </span>
                            <span className="mt-0.5 block max-w-sm truncate text-[11px] text-muted-foreground">
                              {project.description || "Sin descripción"}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {project.clientId
                          ? clientNames.get(project.clientId) ?? "Cliente no disponible"
                          : "Sin cliente"}
                      </td>
                      <td className="px-4 py-3.5">
                        <ProjectStatusBadge status={project.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
                        {formatDate(project.updatedAt)}
                      </td>
                      <td className="px-4 py-2">{renderProjectActions(project)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border md:hidden">
              {filteredProjects.map((project) => (
                <article key={project.id} className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-muted-foreground">
                      <FolderKanban aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/proyectos/${project.id}`}
                        className="inline-flex max-w-full items-center gap-1 rounded text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="truncate">{project.name}</span>
                        <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
                      </Link>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {project.clientId
                          ? clientNames.get(project.clientId) ?? "Cliente no disponible"
                          : "Sin cliente"}
                      </p>
                    </div>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
                    <span className="text-[11px] text-muted-foreground">
                      Actualizado {formatDate(project.updatedAt)}
                    </span>
                    {renderProjectActions(project)}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={hasFilters ? Search : FolderKanban}
            title={hasFilters ? "No hay resultados" : "Todavía no hay proyectos"}
            description={
              hasFilters
                ? "Prueba con otro término o elimina los filtros aplicados."
                : "Crea tu primer proyecto para centralizar mediciones, sistemas y presupuestos."
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  <X aria-hidden="true" className="size-4" />
                  Limpiar filtros
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setDialog({ type: "create" })}
                  disabled={Boolean(storageError)}
                >
                  <Plus aria-hidden="true" className="size-4" />
                  Crear proyecto
                </Button>
              )
            }
          />
        )}
      </section>

      {dialog?.type === "create" ? (
        <ProjectFormDialog
          clients={clients}
          onClose={() => setDialog(null)}
          onSubmit={handleCreate}
        />
      ) : null}
      {dialog?.type === "edit" ? (
        <ProjectFormDialog
          key={dialog.project.id}
          project={dialog.project}
          clients={clients}
          onClose={() => setDialog(null)}
          onSubmit={(input) => handleUpdate(dialog.project, input)}
        />
      ) : null}
      {dialog?.type === "delete" ? (
        <DeleteProjectDialog
          project={dialog.project}
          onClose={() => setDialog(null)}
          onConfirm={() => handleDelete(dialog.project)}
        />
      ) : null}

      {toast ? (
        <div
          role={toast.kind === "error" ? "alert" : "status"}
          className={`fixed right-4 bottom-4 z-[60] flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-command ${
            toast.kind === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            aria-label="Cerrar notificación"
            className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            onClick={() => setToast(null)}
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
