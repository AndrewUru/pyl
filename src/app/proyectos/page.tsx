import { FolderKanban } from "lucide-react";

import { FeatureEmptyPage } from "@/components/feature-empty-page";

export default function ProyectosPage() {
  return (
    <FeatureEmptyPage
      title="Proyectos"
      description="Organiza obras, clientes, mediciones y documentación técnica."
      emptyTitle="Todavía no hay proyectos"
      emptyDescription="Cuando crees tu primer proyecto podrás centralizar aquí su estado, mediciones y presupuestos."
      icon={FolderKanban}
    />
  );
}
