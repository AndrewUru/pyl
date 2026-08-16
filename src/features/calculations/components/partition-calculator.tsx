"use client";

import { useState } from "react";
import { Database, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import {
  PartitionValidationError,
  calculatePartition,
  validatePartitionInput,
  type PartitionValidationIssue,
} from "@/domain/calculations";
import { PartitionForm } from "@/features/calculations/components/partition-form";
import {
  PartitionResults,
  type CalculationFeedback,
  type CompletedPartitionCalculation,
} from "@/features/calculations/components/partition-results";
import {
  createDefaultPartitionDraft,
  partitionDraftToInput,
  type PartitionFormDraft,
} from "@/features/calculations/partition-form-model";
import { useProjects } from "@/hooks/use-local-collections";
import { calculationsService } from "@/lib/services/calculations-service";

function getSaveError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "No se ha podido guardar el cálculo en este dispositivo.";
}

export function PartitionCalculator() {
  const { projects, error: storageError } = useProjects();
  const [draft, setDraft] = useState<PartitionFormDraft>(() =>
    createDefaultPartitionDraft(),
  );
  const [issues, setIssues] = useState<PartitionValidationIssue[]>([]);
  const [calculation, setCalculation] =
    useState<CompletedPartitionCalculation | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<CalculationFeedback | null>(null);

  function handleDraftChange(nextDraft: PartitionFormDraft) {
    setDraft(nextDraft);
    setIssues([]);
    setCalculation(null);
    setFeedback(null);
  }

  function handleCalculate() {
    const input = partitionDraftToInput(draft);
    const validationIssues = validatePartitionInput(input);

    if (validationIssues.length) {
      setIssues(validationIssues);
      setCalculation(null);
      setFeedback(null);
      return;
    }

    try {
      setCalculation({ input, result: calculatePartition(input) });
      setIssues([]);
      setFeedback(null);
    } catch (error: unknown) {
      if (error instanceof PartitionValidationError) {
        setIssues(error.issues);
      } else {
        setIssues([
          {
            path: "calculation",
            code: "not_finite",
            message: "No se ha podido completar el cálculo con estos datos.",
          },
        ]);
      }
      setCalculation(null);
    }
  }

  function handleReset() {
    setDraft(createDefaultPartitionDraft());
    setIssues([]);
    setCalculation(null);
    setSelectedProjectId("");
    setFeedback(null);
  }

  async function handleSave() {
    if (!calculation) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      await calculationsService.savePartition({
        input: calculation.input,
        ...(selectedProjectId ? { projectId: selectedProjectId } : {}),
      });
      setFeedback({
        kind: "success",
        message: "Cálculo guardado correctamente en este dispositivo.",
      });
    } catch (error: unknown) {
      setFeedback({ kind: "error", message: getSaveError(error) });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mediciones"
        title="Calculadora de tabiques"
        description="Calcula superficies, placas, canales, montantes y aislamiento con un modelo geométrico verificable."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted-foreground shadow-xs">
            <Database aria-hidden="true" className="size-3.5" />
            Guardado local
          </div>
        }
      />

      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-950">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p className="text-xs leading-5 text-blue-800">
          El cálculo utiliza únicamente geometría y reglas explícitas. No estima consumibles ni refuerzos sin una regla técnica validada.
        </p>
      </div>

      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <PartitionForm
          draft={draft}
          issues={issues}
          onChange={handleDraftChange}
          onCalculate={handleCalculate}
          onReset={handleReset}
        />
        <PartitionResults
          calculation={calculation}
          projects={projects}
          selectedProjectId={selectedProjectId}
          storageError={storageError}
          isSaving={isSaving}
          feedback={feedback}
          onProjectChange={(projectId) => {
            setSelectedProjectId(projectId);
            setFeedback(null);
          }}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
