import type { Metadata } from "next";
import { Cloud, ShieldCheck } from "lucide-react";

import { getPylAiModel, isPylCopilotConfigured } from "@/ai/config";
import { PageHeader } from "@/components/page-header";
import { CopilotWorkspace } from "@/features/copilot/components/copilot-workspace";

export const metadata: Metadata = {
  title: "PYL Copilot",
};

export default function CopilotPage() {
  const configured = isPylCopilotConfigured();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Fase 2"
        title="PYL Copilot"
        description="Interfaz conversacional para operar las herramientas técnicas de PYL sin duplicar la lógica de negocio."
        actions={
          <div
            className={
              configured
                ? "flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"
                : "flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted-foreground"
            }
          >
            {configured ? (
              <ShieldCheck aria-hidden="true" className="size-3.5" />
            ) : (
              <Cloud aria-hidden="true" className="size-3.5" />
            )}
            {configured ? "Proveedor configurado" : "Proveedor pendiente"}
          </div>
        }
      />
      <CopilotWorkspace configured={configured} model={getPylAiModel()} />
    </div>
  );
}
