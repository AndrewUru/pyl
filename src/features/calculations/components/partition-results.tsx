import {
  Calculator,
  CheckCircle2,
  Layers3,
  LoaderCircle,
  PackageCheck,
  Ruler,
  Save,
  SquareDashed,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import type {
  PartitionCalculationInput,
  PartitionCalculationResult,
} from "@/domain/calculations";
import type { Project } from "@/types/entities";

export interface CompletedPartitionCalculation {
  input: PartitionCalculationInput;
  result: PartitionCalculationResult;
}

export interface CalculationFeedback {
  kind: "success" | "error";
  message: string;
}

interface PartitionResultsProps {
  calculation: CompletedPartitionCalculation | null;
  projects: Project[];
  selectedProjectId: string;
  storageError: string | null;
  isSaving: boolean;
  feedback: CalculationFeedback | null;
  onProjectChange: (projectId: string) => void;
  onSave: () => void;
}

const decimalFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMeasure(value: number, unit: "m" | "m²"): string {
  return `${decimalFormatter.format(value)} ${unit}`;
}

function SystemSummary({ input }: { input: PartitionCalculationInput }) {
  return (
    <div className="border-b border-border bg-surface-muted/35 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-24 min-w-44 flex-1 overflow-hidden rounded-lg border border-border-strong bg-surface">
          <div className="absolute inset-x-3 top-3 bottom-3 flex justify-between">
            {[0, 1, 2, 3, 4, 5, 6].map((line) => (
              <span key={line} className="w-px bg-blue-300/70" />
            ))}
          </div>
          <div className="absolute inset-x-2 top-2 h-1 rounded-full bg-zinc-400" />
          <div className="absolute inset-x-2 bottom-2 h-1 rounded-full bg-zinc-400" />
          {input.hasInsulation ? (
            <div className="absolute inset-4 rounded border border-amber-300/70 bg-amber-100/55" />
          ) : null}
          <span className="absolute right-2 bottom-2 rounded bg-zinc-950/80 px-1.5 py-0.5 font-mono text-[9px] text-white">
            ESQUEMA
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Configuración calculada
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            Tabique · {input.boardsPerFace} {input.boardsPerFace === 1 ? "placa" : "placas"} por cara
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-border bg-surface px-2 py-1 text-[10px] text-muted-foreground">
              {formatMeasure(input.length, "m")} × {formatMeasure(input.height, "m")}
            </span>
            <span className="rounded-full border border-border bg-surface px-2 py-1 text-[10px] text-muted-foreground">
              Modulación {formatMeasure(input.studSpacing, "m")}
            </span>
            <span className="rounded-full border border-border bg-surface px-2 py-1 text-[10px] text-muted-foreground">
              {input.openings.length ? "Con huecos" : "Sin huecos"}
            </span>
            <span className="rounded-full border border-border bg-surface px-2 py-1 text-[10px] text-muted-foreground">
              {input.hasInsulation ? "Con aislamiento" : "Sin aislamiento"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ResultMetricProps {
  label: string;
  value: string;
  helper: string;
  icon: typeof Calculator;
}

function ResultMetric({ label, value, helper, icon: Icon }: ResultMetricProps) {
  return (
    <div className="min-w-0 bg-surface px-4 py-4 sm:px-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon aria-hidden="true" className="size-3.5" />
        <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p className="mt-2 font-mono text-xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{helper}</p>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right font-mono text-xs font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}

export function PartitionResults({
  calculation,
  projects,
  selectedProjectId,
  storageError,
  isSaving,
  feedback,
  onProjectChange,
  onSave,
}: PartitionResultsProps) {
  if (!calculation) {
    return (
      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-panel lg:sticky lg:top-20">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold text-foreground">Resultados</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            La medición aparecerá aquí después de validar los datos.
          </p>
        </div>
        <EmptyState
          icon={Calculator}
          title="Preparado para calcular"
          description="Completa las dimensiones del tabique y pulsa “Calcular tabique”."
        />
      </section>
    );
  }

  const { input, result } = calculation;

  return (
    <section
      aria-live="polite"
      className="overflow-hidden rounded-xl border border-border bg-surface shadow-panel lg:sticky lg:top-20"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-5">
        <div>
          <p className="font-mono text-[10px] font-medium tracking-[0.14em] text-emerald-700 uppercase">
            Cálculo completado
          </p>
          <h2 className="mt-1 text-base font-semibold text-foreground">Resultado del tabique</h2>
        </div>
        <span className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckCircle2 aria-hidden="true" className="size-4" />
        </span>
      </div>

      <SystemSummary input={input} />

      <div className="grid grid-cols-2 gap-px bg-border">
        <ResultMetric
          label="Placas"
          value={`${result.boardCount} ud.`}
          helper="Redondeo al alza con merma"
          icon={PackageCheck}
        />
        <ResultMetric
          label="Superficie placa"
          value={formatMeasure(result.totalBoardArea, "m²")}
          helper="Dos caras y todas las capas"
          icon={Layers3}
        />
        <ResultMetric
          label="Montantes"
          value={`${result.studCount} ud.`}
          helper="Modulación regular aproximada"
          icon={Ruler}
        />
        <ResultMetric
          label="Canales"
          value={formatMeasure(result.trackLength, "m")}
          helper="Canal superior e inferior"
          icon={SquareDashed}
        />
      </div>

      <div className="border-t border-border">
        <div className="border-b border-border bg-surface-muted/35 px-4 py-2.5 sm:px-5">
          <h3 className="text-[11px] font-semibold tracking-wide text-foreground uppercase">
            Desglose de superficies
          </h3>
        </div>
        <dl className="divide-y divide-border">
          <ResultRow label="Superficie bruta" value={formatMeasure(result.grossArea, "m²")} />
          <ResultRow label="Superficie de huecos" value={formatMeasure(result.openingsArea, "m²")} />
          <ResultRow label="Superficie neta" value={formatMeasure(result.netArea, "m²")} />
          <ResultRow
            label="Placa antes de merma"
            value={formatMeasure(result.boardAreaBeforeWaste, "m²")}
          />
          <ResultRow
            label="Aislamiento"
            value={
              input.hasInsulation
                ? formatMeasure(result.insulationArea, "m²")
                : "No incluido"
            }
          />
          <ResultRow label="Merma aplicada" value={`${decimalFormatter.format(result.wastePercentage)} %`} />
        </dl>
      </div>

      <div className="border-t border-border bg-surface-muted/35 p-4 sm:p-5">
        <label htmlFor="calculation-project" className="text-xs font-medium text-foreground">
          Asociar a un proyecto
        </label>
        <select
          id="calculation-project"
          value={selectedProjectId}
          onChange={(event) => onProjectChange(event.target.value)}
          disabled={isSaving || Boolean(storageError)}
          className="mt-1.5 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-muted"
        >
          <option value="">Sin proyecto</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>

        {storageError ? (
          <p className="mt-2 text-xs leading-5 text-amber-700">
            No se puede acceder al almacenamiento local: {storageError}
          </p>
        ) : null}
        {feedback ? (
          <p
            role={feedback.kind === "error" ? "alert" : "status"}
            className={`mt-2 text-xs font-medium ${
              feedback.kind === "error" ? "text-red-700" : "text-emerald-700"
            }`}
          >
            {feedback.message}
          </p>
        ) : null}

        <Button
          variant="primary"
          className="mt-3 w-full"
          disabled={isSaving || Boolean(storageError)}
          onClick={onSave}
        >
          {isSaving ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          Guardar cálculo
        </Button>
        <p className="mt-3 text-[10px] leading-4 text-muted-foreground">
          Estimación geométrica. Los montantes no incluyen refuerzos específicos de huecos. No se calculan tornillos, pasta ni cinta sin una regla técnica validada.
        </p>
      </div>
    </section>
  );
}
