import { Users } from "lucide-react";

import { FeatureEmptyPage } from "@/components/feature-empty-page";

export default function ClientesPage() {
  return (
    <FeatureEmptyPage
      title="Clientes"
      description="Mantén los datos de contacto y la relación con cada obra."
      emptyTitle="Aún no hay clientes"
      emptyDescription="Los clientes y empresas que añadas quedarán almacenados localmente en este dispositivo."
      icon={Users}
    />
  );
}
