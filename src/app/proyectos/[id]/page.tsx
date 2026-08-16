import type { Metadata } from "next";

import { ProjectDetailWorkspace } from "@/features/projects/components/project-detail-workspace";

export const metadata: Metadata = {
  title: "Detalle del proyecto | PYL",
};

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  return <ProjectDetailWorkspace projectId={id} />;
}
