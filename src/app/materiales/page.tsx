import { PackageSearch } from "lucide-react";

import { FeatureEmptyPage } from "@/components/feature-empty-page";

export default function MaterialesPage() {
  return (
    <FeatureEmptyPage
      title="Materiales"
      description="Catálogo técnico de placas, perfiles, aislamientos y consumibles."
      emptyTitle="Catálogo pendiente de configurar"
      emptyDescription="Los materiales y sus precios de referencia estarán disponibles aquí para cálculos y presupuestos."
      icon={PackageSearch}
    />
  );
}
