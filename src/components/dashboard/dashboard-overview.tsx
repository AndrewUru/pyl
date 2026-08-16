"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Calculator,
  Clock3,
  FolderKanban,
  PackageSearch,
  Plus,
  ReceiptText,
  Settings2,
} from "lucide-react";

import { CommandInput } from "@/components/command-input";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { StatCard } from "@/components/stat-card";
import { buttonClassName } from "@/components/ui/button";
import {
  useBudgets,
  useCalculations,
  useProjects,
} from "@/hooks/use-local-collections";
import { cn } from "@/lib/utils";
import {
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
} from "@/domain/projects";

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
});

const statusLabels: Record<ProjectStatus, string> = PROJECT_STATUS_LABELS;

interface ActivityEntry {
  id: string;
  title: string;
  context: string;
  date: string;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Sin fecha" : dateFormatter.format(date);
}

function LoadingRows() {
  return (
    <div className="space-y-1 p-2" aria-label="Cargando datos">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-lg px-3 py-3">
          <div className="size-8 animate-pulse rounded-md bg-surface-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
            <div className="h-2.5 w-1/2 animate-pulse rounded bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RowIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-muted text-muted-foreground">
      {children}
    </span>
  );
}

const quickAccess = [
  {
    href: "/materiales",
    label: "Catálogo de materiales",
    description: "Placas, perfiles y consumibles",
    icon: PackageSearch,
  },
  {
    href: "/guias",
    label: "Guías técnicas",
    description: "Sistemas y buenas prácticas",
    icon: BookOpen,
  },
  {
    href: "/configuracion",
    label: "Preferencias",
    description: "Márgenes, IVA y empresa",
    icon: Settings2,
  },
];

export function DashboardOverview() {
  const { projects, isLoading: projectsLoading } = useProjects();
  const { budgets, isLoading: budgetsLoading } = useBudgets();
  const { calculations, isLoading: calculationsLoading } = useCalculations();

  const activeProjects = projects.filter(
    (project) =>
      project.status === "draft" || project.status === "active",
  );
  const recentProjects = [...activeProjects]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 4);
  const recentBudgets = [...budgets]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 4);
  const recentCalculations = [...calculations]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 4);

  const recentActivity: ActivityEntry[] = [
    ...projects.map((project) => ({
      id: `project-${project.id}`,
      title: project.name,
      context: "Proyecto actualizado",
      date: project.updatedAt,
    })),
    ...budgets.map((budget) => ({
      id: `budget-${budget.id}`,
      title: budget.name,
      context: "Presupuesto actualizado",
      date: budget.updatedAt,
    })),
    ...calculations.map((calculation) => ({
      id: `calculation-${calculation.id}`,
      title: calculation.type,
      context: "Cálculo realizado",
      date: calculation.createdAt,
    })),
  ]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 6);

  const activityLoading =
    projectsLoading || budgetsLoading || calculationsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="PYL Workspace"
        description="Gestión técnica de proyectos, mediciones y presupuestos."
        actions={
          <>
            <Link
              href="/proyectos"
              className={buttonClassName({ variant: "primary", size: "default" })}
            >
              <Plus aria-hidden="true" className="size-4" />
              Nuevo proyecto
            </Link>
            <Link
              href="/calculadora"
              className={buttonClassName({ variant: "secondary", size: "default" })}
            >
              Nueva medición
            </Link>
            <Link
              href="/presupuestos"
              className={cn(
                buttonClassName({ variant: "secondary", size: "default" }),
                "hidden lg:inline-flex",
              )}
            >
              Nuevo presupuesto
            </Link>
          </>
        }
      />

      <CommandInput />

      <section aria-label="Resumen" className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 min-[1180px]:grid-cols-4">
        <StatCard
          label="Proyectos activos"
          value={activeProjects.length}
          helper="Borradores o en curso"
          icon={FolderKanban}
          isLoading={projectsLoading}
        />
        <StatCard
          label="Presupuestos"
          value={budgets.length}
          helper="Guardados en este dispositivo"
          icon={ReceiptText}
          isLoading={budgetsLoading}
        />
        <StatCard
          label="Cálculos"
          value={calculations.length}
          helper="Histórico de mediciones"
          icon={Calculator}
          isLoading={calculationsLoading}
        />
        <StatCard
          label="Actividad reciente"
          value={recentActivity.length}
          helper="Últimos cambios locales"
          icon={Activity}
          isLoading={activityLoading}
        />
      </section>

      <div className="grid min-w-0 gap-4 min-[1180px]:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.8fr)]">
        <div className="min-w-0 space-y-4">
          <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-panel">
            <SectionHeader
              title="Proyectos activos"
              description="Obras que requieren seguimiento"
              action={
                <Link
                  href="/proyectos"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Ver todos
                </Link>
              }
            />
            {projectsLoading ? (
              <LoadingRows />
            ) : recentProjects.length ? (
              <div className="divide-y divide-border">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/proyectos/${project.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5"
                  >
                    <RowIcon>
                      <FolderKanban aria-hidden="true" className="size-4" />
                    </RowIcon>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {project.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Actualizado {formatDate(project.updatedAt)}
                      </p>
                    </div>
                    <span className="rounded-full border border-border bg-surface-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                      {statusLabels[project.status]}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                icon={FolderKanban}
                title="Sin proyectos activos"
                description="Los proyectos en borrador o activos aparecerán aquí."
              />
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-panel">
            <SectionHeader
              title="Presupuestos"
              description="Últimos documentos actualizados"
              action={
                <Link
                  href="/presupuestos"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Ver todos
                </Link>
              }
            />
            {budgetsLoading ? (
              <LoadingRows />
            ) : recentBudgets.length ? (
              <div className="divide-y divide-border">
                {recentBudgets.map((budget) => (
                  <Link
                    key={budget.id}
                    href="/presupuestos"
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5"
                  >
                    <RowIcon>
                      <ReceiptText aria-hidden="true" className="size-4" />
                    </RowIcon>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {budget.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Actualizado {formatDate(budget.updatedAt)}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-medium text-foreground">
                      {currencyFormatter.format(budget.total / 100)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                icon={ReceiptText}
                title="Sin presupuestos"
                description="Los presupuestos guardados aparecerán en esta sección."
              />
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-panel">
            <SectionHeader
              title="Cálculos recientes"
              description="Últimas mediciones realizadas"
              action={
                <Link
                  href="/calculadora"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Abrir calculadora
                </Link>
              }
            />
            {calculationsLoading ? (
              <LoadingRows />
            ) : recentCalculations.length ? (
              <div className="divide-y divide-border">
                {recentCalculations.map((calculation) => (
                  <Link
                    key={calculation.id}
                    href="/calculadora"
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5"
                  >
                    <RowIcon>
                      <Calculator aria-hidden="true" className="size-4" />
                    </RowIcon>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {calculation.type}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Creado {formatDate(calculation.createdAt)}
                      </p>
                    </div>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                icon={Calculator}
                title="Sin cálculos recientes"
                description="Tus próximas mediciones quedarán disponibles aquí."
              />
            )}
          </section>
        </div>

        <div className="min-w-0 space-y-4">
          <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-panel">
            <SectionHeader
              title="Actividad reciente"
              description="Cambios en este dispositivo"
            />
            {activityLoading ? (
              <LoadingRows />
            ) : recentActivity.length ? (
              <ol className="divide-y divide-border">
                {recentActivity.map((entry) => (
                  <li key={entry.id} className="flex gap-3 px-4 py-3.5 sm:px-5">
                    <RowIcon>
                      <Clock3 aria-hidden="true" className="size-4" />
                    </RowIcon>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {entry.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {entry.context} · {formatDate(entry.date)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState
                compact
                icon={Activity}
                title="Sin actividad todavía"
                description="Los cambios de proyectos y presupuestos se registrarán aquí."
              />
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-panel">
            <SectionHeader
              title="Accesos rápidos"
              description="Herramientas frecuentes"
            />
            <div className="space-y-1 p-2">
              {quickAccess.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <RowIcon>
                      <Icon aria-hidden="true" className="size-4" />
                    </RowIcon>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
