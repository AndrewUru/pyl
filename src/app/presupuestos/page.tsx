import { ReceiptText } from "lucide-react";

import { FeatureEmptyPage } from "@/components/feature-empty-page";

export default function PresupuestosPage() {
  return (
    <FeatureEmptyPage
      title="Presupuestos"
      description="Convierte mediciones en ofertas claras, trazables y listas para entregar."
      emptyTitle="No hay presupuestos guardados"
      emptyDescription="Los presupuestos creados en este dispositivo aparecerán aquí con su estado y total."
      icon={ReceiptText}
    />
  );
}
