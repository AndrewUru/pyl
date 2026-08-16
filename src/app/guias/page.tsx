import { BookOpen } from "lucide-react";

import { FeatureEmptyPage } from "@/components/feature-empty-page";

export default function GuiasPage() {
  return (
    <FeatureEmptyPage
      title="Guías"
      description="Consulta criterios de montaje, sistemas y buenas prácticas PYL."
      emptyTitle="Biblioteca técnica en preparación"
      emptyDescription="Las fichas y referencias especializadas se organizarán aquí para su consulta rápida."
      icon={BookOpen}
    />
  );
}
