import { Calculator } from "lucide-react";

import { FeatureEmptyPage } from "@/components/feature-empty-page";

export default function CalculadoraPage() {
  return (
    <FeatureEmptyPage
      title="Calculadora"
      description="Prepara mediciones de sistemas PYL y desgloses de material."
      emptyTitle="Inicia una nueva medición"
      emptyDescription="Los asistentes de cálculo para placas, perfiles, aislamiento y consumibles se incorporarán en esta sección."
      icon={Calculator}
    />
  );
}
