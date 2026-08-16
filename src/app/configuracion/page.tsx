import { Settings2 } from "lucide-react";

import { FeatureEmptyPage } from "@/components/feature-empty-page";

export default function ConfiguracionPage() {
  return (
    <FeatureEmptyPage
      title="Configuración"
      description="Ajusta los datos de empresa, impuestos y criterios de cálculo."
      emptyTitle="Preferencias listas para personalizar"
      emptyDescription="En la próxima fase podrás configurar empresa, merma predeterminada, margen e IVA."
      icon={Settings2}
    />
  );
}
