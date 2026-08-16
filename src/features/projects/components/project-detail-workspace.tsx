"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  ArrowLeft,
  CalendarDays,
  DatabaseZap,
  FolderKanban,
  Layers3,
  LayoutDashboard,
  PackageSearch,
  ReceiptText,
  Ruler,
  UserRound,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { buttonClassName } from "@/components/ui/button";
import { ProjectStatusBadge } from "@/features/projects/components/project-status-badge";
import { useClients, useProject } from "@/hooks/use-local-collections";
import { cn } from "@/lib/utils";

const detailDateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const projectSections = [
  {
    id: "summary",
    label: "Resumen",
    title: "Resumen del proyecto",
    description: "Información general y vinculación con el cliente.",
    icon: LayoutDashboard,
  },
  {
    id: "measurements",
    label: "Mediciones",
    title: "Sin mediciones",
    description: "Las mediciones asociadas al proyecto aparecerán en esta sección.",
    icon: Ruler,
  },
  {
    id: "systems",
    label: "Sistemas",
    title: "Sin sistemas definidos",
    description: "Aquí podrás organizar trasdosados, tabiques y techos del proyecto.",
    icon: Layers3,
  },
  {
    id: "materials",
    label: "Materiales",
    title: "Sin materiales asociados",
    description: "El desglose de placas, perfiles y consumibles quedará disponible aquí.",
    icon: PackageSearch,
  },
  {
    id: "budget",
    label: "Presupuesto",
    title: "Sin presupuesto vinculado",
    description: "Podrás preparar y consultar el presupuesto del proyecto desde aquí.",
    icon: ReceiptText,
  },
] as const;

type SectionId = (typeof projectSections)[number]["id"];

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Fecha no disponible"
    : detailDateFormatter.format(date);
}

function ProjectDetailSkeleton() {
  return (
    <div aria-label="Cargando proyecto" className="space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
        <div className="h-8 w-64 max-w-full animate-pulse rounded bg-surface-muted" />
        <div className="h-3 w-80 max-w-full animate-pulse rounded bg-surface-muted" />
      </div>
      <div className="h-12 animate-pulse rounded-xl border border-border bg-surface" />
      <div className="h-72 animate-pulse rounded-xl border border-border bg-surface" />
    </div>
  );
}

export function ProjectDetailWorkspace({ projectId }: { projectId: string }) {
  const { project, isLoading, error: projectError } = useProject(projectId);
  const { clients, error: clientsError } = useClients();
  const [activeSection, setActiveSection] = useState<SectionId>("summary");

  const client = useMemo(
    () => clients.find((item) => item.id === project?.clientId),
    [clients, project?.clientId],
  );
  const selectedSection = projectSections.find(
    (section) => section.id === activeSection,
  ) ?? projectSections[0];
  const storageError = projectError ?? clientsError;

  function handleTabKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    sectionId: SectionId,
  ) {
    const currentIndex = projectSections.findIndex(
      (section) => section.id === sectionId,
    );
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % projectSections.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        (currentIndex - 1 + projectSections.length) % projectSections.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = projectSections.length - 1;
    }

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    const nextSection = projectSections[nextIndex];
    setActiveSection(nextSection.id);
    document.getElementById(`project-tab-${nextSection.id}`)?.focus();
  }

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (storageError) {
    return (
      <div className="space-y-5">
        <Link
          href="/proyectos"
          className={buttonClassName({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Volver a proyectos
        </Link>
        <section className="rounded-xl border border-amber-200 bg-amber-50">
          <EmptyState
            icon={DatabaseZap}
            title="No se puede abrir el almacenamiento local"
            description={`${storageError} Comprueba los permisos del navegador e inténtalo de nuevo.`}
          />
        </section>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-5">
        <Link
          href="/proyectos"
          className={buttonClassName({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Volver a proyectos
        </Link>
        <section className="rounded-xl border border-border bg-surface shadow-panel">
          <EmptyState
            icon={FolderKanban}
            title="Proyecto no encontrado"
            description="Puede que se haya eliminado o que este enlace pertenezca a otro dispositivo."
            action={
              <Link
                href="/proyectos"
                className={buttonClassName({ variant: "primary" })}
              >
                Ver proyectos
              </Link>
            }
          />
        </section>
      </div>
    );
  }

  const SelectedIcon = selectedSection.icon;

  return (
    <div className="space-y-6">
      <Link
        href="/proyectos"
        className={cn(
          buttonClassName({ variant: "ghost", size: "sm" }),
          "-ml-2",
        )}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Proyectos
      </Link>

      <PageHeader
        eyebrow="Proyecto"
        title={project.name}
        description={
          project.description ||
          "Espacio técnico para centralizar mediciones, sistemas, materiales y presupuesto."
        }
        actions={<ProjectStatusBadge status={project.status} />}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-panel">
        <div
          role="tablist"
          aria-label="Secciones del proyecto"
          className="flex overflow-x-auto border-b border-border px-2"
        >
          {projectSections.map((section) => {
            const Icon = section.icon;
            const isActive = section.id === activeSection;
            return (
              <button
                key={section.id}
                id={`project-tab-${section.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`project-panel-${section.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveSection(section.id)}
                onKeyDown={(event) => handleTabKeyDown(event, section.id)}
                className={cn(
                  "relative flex h-12 shrink-0 items-center gap-2 px-3 text-xs font-medium transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-4",
                  isActive
                    ? "text-foreground after:absolute after:right-3 after:bottom-0 after:left-3 after:h-0.5 after:bg-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
                {section.label}
              </button>
            );
          })}
        </div>

        <div
          id={`project-panel-${activeSection}`}
          role="tabpanel"
          aria-labelledby={`project-tab-${activeSection}`}
          tabIndex={0}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          {activeSection === "summary" ? (
            <div className="grid min-w-0 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)]">
              <section className="min-w-0 lg:border-r lg:border-border">
                <SectionHeader
                  title="Información general"
                  description="Datos principales guardados en este dispositivo"
                />
                <dl className="grid gap-px bg-border sm:grid-cols-2">
                  <div className="bg-surface px-5 py-4">
                    <dt className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase">
                      <UserRound aria-hidden="true" className="size-3.5" />
                      Cliente
                    </dt>
                    <dd className="mt-2 text-sm font-medium text-foreground">
                      {client?.name ??
                        (project.clientId ? "Cliente no disponible" : "Sin cliente")}
                    </dd>
                    {client?.company ? (
                      <dd className="mt-0.5 text-xs text-muted-foreground">
                        {client.company}
                      </dd>
                    ) : null}
                  </div>
                  <div className="bg-surface px-5 py-4">
                    <dt className="text-[11px] font-medium text-muted-foreground uppercase">
                      Estado
                    </dt>
                    <dd className="mt-2">
                      <ProjectStatusBadge status={project.status} />
                    </dd>
                  </div>
                  <div className="bg-surface px-5 py-4 sm:col-span-2">
                    <dt className="text-[11px] font-medium text-muted-foreground uppercase">
                      Descripción
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-foreground">
                      {project.description || "No se ha añadido una descripción."}
                    </dd>
                  </div>
                </dl>
              </section>

              <aside>
                <SectionHeader title="Registro" description="Trazabilidad local" />
                <dl className="space-y-5 px-5 py-5">
                  <div>
                    <dt className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase">
                      <CalendarDays aria-hidden="true" className="size-3.5" />
                      Creado
                    </dt>
                    <dd className="mt-1.5 text-xs text-foreground">
                      {formatDateTime(project.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase">
                      <CalendarDays aria-hidden="true" className="size-3.5" />
                      Última modificación
                    </dt>
                    <dd className="mt-1.5 text-xs text-foreground">
                      {formatDateTime(project.updatedAt)}
                    </dd>
                  </div>
                </dl>
              </aside>
            </div>
          ) : (
            <EmptyState
              icon={SelectedIcon}
              title={selectedSection.title}
              description={selectedSection.description}
            />
          )}
        </div>
      </div>
    </div>
  );
}
