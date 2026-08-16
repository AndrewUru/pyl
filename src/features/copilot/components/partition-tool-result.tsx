"use client";

import { useState } from "react";
import { Check, Database, LoaderCircle, TriangleAlert } from "lucide-react";

import type { PylCopilotUIMessage } from "@/ai/agents/pyl-copilot-agent";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import { calculationsService } from "@/lib/services/calculations-service";

type CopilotMessagePart = PylCopilotUIMessage["parts"][number];
type CalculatePartitionPart = Extract<
  CopilotMessagePart,
  { type: "tool-calculatePartition" }
>;

interface PartitionToolResultProps {
  part: CalculatePartitionPart;
}

const numberFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 2,
});

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function getSaveError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "No se ha podido guardar el cálculo en este dispositivo.";
}

export function PartitionToolResult({ part }: PartitionToolResultProps) {
  const [saveState, setSaveState] = useState<
    { status: "idle" | "saving" | "saved" | "error"; message?: string }
  >({ status: "idle" });
  const isComplete = part.state === "output-available";

  async function handleSave() {
    if (part.state !== "output-available" || !part.output.ok) return;

    setSaveState({ status: "saving" });
    try {
      await calculationsService.savePartition({ input: part.output.input });
      setSaveState({
        status: "saved",
        message: "Cálculo guardado localmente.",
      });
    } catch (error: unknown) {
      setSaveState({ status: "error", message: getSaveError(error) });
    }
  }

  return (
    <Tool
      defaultOpen={isComplete || part.state === "output-error"}
      className="my-1 overflow-hidden border-border bg-surface shadow-xs"
    >
      <ToolHeader
        type={part.type}
        state={part.state}
        title="Motor de cálculo · Tabique PYL"
      />
      <ToolContent className="border-t border-border bg-surface-muted/35">
        {part.state !== "input-streaming" ? (
          <ToolInput input={part.input} />
        ) : null}

        {part.state === "output-error" ? (
          <ToolOutput output={undefined} errorText={part.errorText} />
        ) : null}

        {part.state === "output-available" && !part.output.ok ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <TriangleAlert aria-hidden="true" className="size-4" />
              Revisa los datos del tabique
            </div>
            <ul className="mt-2 space-y-1 pl-5 text-xs leading-5 text-amber-800">
              {part.output.issues.map((issue) => (
                <li key={`${issue.path}-${issue.code}`} className="list-disc">
                  {issue.message}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {part.state === "output-available" && part.output.ok ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
              <ResultMetric
                label="Superficie neta"
                value={`${formatNumber(part.output.result.netArea)} m²`}
              />
              <ResultMetric
                label="Placa con merma"
                value={`${formatNumber(part.output.result.totalBoardArea)} m²`}
              />
              <ResultMetric
                label="Placas aprox."
                value={formatNumber(part.output.result.boardCount)}
              />
              <ResultMetric
                label="Montantes aprox."
                value={formatNumber(part.output.result.studCount)}
              />
              <ResultMetric
                label="Superficie bruta"
                value={`${formatNumber(part.output.result.grossArea)} m²`}
              />
              <ResultMetric
                label="Huecos"
                value={`${formatNumber(part.output.result.openingsArea)} m²`}
              />
              <ResultMetric
                label="Canales"
                value={`${formatNumber(part.output.result.trackLength)} ml`}
              />
              <ResultMetric
                label="Aislamiento"
                value={`${formatNumber(part.output.result.insulationArea)} m²`}
              />
            </div>

            <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] leading-4 text-muted-foreground">
                Resultado determinista de calculatePartition() · Merma {formatNumber(part.output.result.wastePercentage)} %
              </p>
              <Button
                variant={saveState.status === "saved" ? "outline" : "primary"}
                size="sm"
                disabled={saveState.status === "saving" || saveState.status === "saved"}
                onClick={handleSave}
              >
                {saveState.status === "saving" ? (
                  <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
                ) : saveState.status === "saved" ? (
                  <Check aria-hidden="true" className="size-3.5" />
                ) : (
                  <Database aria-hidden="true" className="size-3.5" />
                )}
                {saveState.status === "saved" ? "Guardado" : "Guardar cálculo"}
              </Button>
            </div>

            {saveState.message ? (
              <p
                role="status"
                className={
                  saveState.status === "error"
                    ? "text-xs text-red-700"
                    : "text-xs text-emerald-700"
                }
              >
                {saveState.message}
              </p>
            ) : null}
          </div>
        ) : null}
      </ToolContent>
    </Tool>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 bg-surface px-3 py-3">
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
