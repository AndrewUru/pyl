"use client";

import type { InputHTMLAttributes } from "react";
import { DoorOpen, Plus, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  OPENING_TYPES,
  type OpeningType,
  type PartitionValidationIssue,
} from "@/domain/calculations";
import {
  createOpeningDraft,
  type PartitionFormDraft,
  type PartitionOpeningDraft,
} from "@/features/calculations/partition-form-model";
import { cn } from "@/lib/utils";

const openingLabels: Record<OpeningType, string> = {
  door: "Puerta",
  window: "Ventana",
  custom: "Personalizado",
};

function isOpeningType(value: string): value is OpeningType {
  return OPENING_TYPES.some((type) => type === value);
}

interface NumericFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "id" | "type" | "value" | "onChange"
  > {
  id: string;
  label: string;
  value: string;
  unit?: string;
  error?: boolean;
  onValueChange: (value: string) => void;
}

function NumericField({
  id,
  label,
  value,
  unit,
  error = false,
  onValueChange,
  className,
  ...props
}: NumericFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          {...props}
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          aria-invalid={error}
          onChange={(event) => onValueChange(event.target.value)}
          className={cn(
            "h-10 w-full rounded-lg border bg-surface px-3 text-sm text-foreground outline-none transition focus:ring-2",
            unit ? "pr-10" : null,
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
              : "border-border-strong focus:border-primary focus:ring-primary/15",
          )}
        />
        {unit ? (
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-[11px] text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
}

interface PartitionFormProps {
  draft: PartitionFormDraft;
  issues: PartitionValidationIssue[];
  onChange: (draft: PartitionFormDraft) => void;
  onCalculate: () => void;
  onReset: () => void;
}

export function PartitionForm({
  draft,
  issues,
  onChange,
  onCalculate,
  onReset,
}: PartitionFormProps) {
  const issuePaths = new Set(issues.map((issue) => issue.path));

  function hasIssue(path: string): boolean {
    return issuePaths.has(path);
  }

  function updateField<Key extends keyof PartitionFormDraft>(
    key: Key,
    value: PartitionFormDraft[Key],
  ) {
    onChange({ ...draft, [key]: value });
  }

  function addOpening() {
    updateField("openings", [...draft.openings, createOpeningDraft()]);
  }

  function updateOpening(
    id: string,
    changes: Partial<Omit<PartitionOpeningDraft, "id">>,
  ) {
    updateField(
      "openings",
      draft.openings.map((opening) =>
        opening.id === id ? { ...opening, ...changes } : opening,
      ),
    );
  }

  function removeOpening(id: string) {
    updateField(
      "openings",
      draft.openings.filter((opening) => opening.id !== id),
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onCalculate();
      }}
      className="overflow-hidden rounded-xl border border-border bg-surface shadow-panel"
    >
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <p className="font-mono text-[10px] font-medium tracking-[0.14em] text-primary uppercase">
          Sistema 01
        </p>
        <h2 className="mt-1 text-base font-semibold text-foreground">Tabique PYL</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Define la geometría, la modulación y las placas del sistema.
        </p>
      </div>

      <div className="divide-y divide-border">
        <fieldset className="space-y-4 p-4 sm:p-5">
          <legend className="text-xs font-semibold text-foreground">Geometría</legend>
          <div className="grid grid-cols-2 gap-3">
            <NumericField
              id="partition-length"
              label="Longitud"
              value={draft.length}
              unit="m"
              min="0"
              step="0.01"
              required
              error={hasIssue("length")}
              onValueChange={(value) => updateField("length", value)}
            />
            <NumericField
              id="partition-height"
              label="Altura"
              value={draft.height}
              unit="m"
              min="0"
              step="0.01"
              required
              error={hasIssue("height")}
              onValueChange={(value) => updateField("height", value)}
            />
          </div>
        </fieldset>

        <section className="space-y-4 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold text-foreground">Huecos</h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Puertas, ventanas o huecos personalizados.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={addOpening}>
              <Plus aria-hidden="true" className="size-3.5" />
              Añadir hueco
            </Button>
          </div>

          {draft.openings.length ? (
            <div className="space-y-3">
              {draft.openings.map((opening, index) => {
                const path = `openings.${index}`;
                return (
                  <div
                    key={opening.id}
                    className="rounded-lg border border-border bg-surface-muted/45 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <DoorOpen aria-hidden="true" className="size-4 text-muted-foreground" />
                      <label
                        htmlFor={`${opening.id}-type`}
                        className="sr-only"
                      >
                        Tipo de hueco {index + 1}
                      </label>
                      <select
                        id={`${opening.id}-type`}
                        value={opening.type}
                        onChange={(event) => {
                          if (isOpeningType(event.target.value)) {
                            updateOpening(opening.id, {
                              type: event.target.value,
                            });
                          }
                        }}
                        className="h-8 min-w-0 flex-1 rounded-md border border-border bg-surface px-2 text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                      >
                        {OPENING_TYPES.map((type) => (
                          <option key={type} value={type}>{openingLabels[type]}</option>
                        ))}
                      </select>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Eliminar hueco ${index + 1}`}
                        title="Eliminar hueco"
                        className="size-8 hover:bg-red-50 hover:text-red-700"
                        onClick={() => removeOpening(opening.id)}
                      >
                        <Trash2 aria-hidden="true" className="size-3.5" />
                      </Button>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <NumericField
                        id={`${opening.id}-width`}
                        label="Ancho"
                        value={opening.width}
                        unit="m"
                        min="0"
                        step="0.01"
                        required
                        error={hasIssue(`${path}.width`)}
                        onValueChange={(value) =>
                          updateOpening(opening.id, { width: value })
                        }
                      />
                      <NumericField
                        id={`${opening.id}-height`}
                        label="Alto"
                        value={opening.height}
                        unit="m"
                        min="0"
                        step="0.01"
                        required
                        error={hasIssue(`${path}.height`)}
                        onValueChange={(value) =>
                          updateOpening(opening.id, { height: value })
                        }
                      />
                      <NumericField
                        id={`${opening.id}-quantity`}
                        label="Cantidad"
                        value={opening.quantity}
                        min="1"
                        step="1"
                        required
                        error={hasIssue(`${path}.quantity`)}
                        onValueChange={(value) =>
                          updateOpening(opening.id, { quantity: value })
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border-strong px-4 py-5 text-center text-xs text-muted-foreground">
              El tabique se calculará sin descontar huecos.
            </div>
          )}
        </section>

        <fieldset className="space-y-4 p-4 sm:p-5">
          <legend className="text-xs font-semibold text-foreground">Placas y estructura</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="boards-per-face"
                className="text-xs font-medium text-foreground"
              >
                Placas por cara
              </label>
              <select
                id="boards-per-face"
                value={draft.boardsPerFace}
                aria-invalid={hasIssue("boardsPerFace")}
                onChange={(event) =>
                  updateField("boardsPerFace", event.target.value)
                }
                className="mt-1.5 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {[1, 2, 3, 4].map((layers) => (
                  <option key={layers} value={layers}>{layers}</option>
                ))}
              </select>
            </div>
            <NumericField
              id="stud-spacing"
              label="Separación montantes"
              value={draft.studSpacing}
              unit="m"
              min="0"
              step="0.01"
              required
              error={hasIssue("studSpacing")}
              onValueChange={(value) => updateField("studSpacing", value)}
            />
            <NumericField
              id="board-width"
              label="Ancho de placa"
              value={draft.boardWidth}
              unit="m"
              min="0"
              step="0.01"
              required
              error={hasIssue("boardWidth")}
              onValueChange={(value) => updateField("boardWidth", value)}
            />
            <NumericField
              id="board-height"
              label="Alto de placa"
              value={draft.boardHeight}
              unit="m"
              min="0"
              step="0.01"
              required
              error={hasIssue("boardHeight")}
              onValueChange={(value) => updateField("boardHeight", value)}
            />
            <NumericField
              id="waste-percentage"
              label="Merma"
              value={draft.wastePercentage}
              unit="%"
              min="0"
              max="100"
              step="0.5"
              required
              error={hasIssue("wastePercentage")}
              onValueChange={(value) => updateField("wastePercentage", value)}
            />
            <div>
              <span className="text-xs font-medium text-foreground">Aislamiento</span>
              <button
                type="button"
                role="switch"
                aria-checked={draft.hasInsulation}
                onClick={() =>
                  updateField("hasInsulation", !draft.hasInsulation)
                }
                className="mt-1.5 flex h-10 w-full items-center justify-between rounded-lg border border-border-strong bg-surface px-3 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {draft.hasInsulation ? "Incluido" : "No incluido"}
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-5 w-9 items-center rounded-full p-0.5 transition-colors",
                    draft.hasInsulation ? "bg-primary" : "bg-border-strong",
                  )}
                >
                  <span
                    className={cn(
                      "size-4 rounded-full bg-white shadow-xs transition-transform",
                      draft.hasInsulation ? "translate-x-4" : "translate-x-0",
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </fieldset>
      </div>

      {issues.length ? (
        <div role="alert" className="mx-4 mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 sm:mx-5">
          <p className="text-xs font-semibold text-red-800">Revisa los datos del cálculo</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-5 text-red-700">
            {issues.map((issue) => (
              <li key={`${issue.path}-${issue.code}`}>{issue.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-muted/40 px-4 py-4 sm:px-5">
        <Button variant="ghost" onClick={onReset}>
          <RotateCcw aria-hidden="true" className="size-4" />
          Limpiar
        </Button>
        <Button variant="primary" type="submit">
          Calcular tabique
        </Button>
      </div>
    </form>
  );
}
