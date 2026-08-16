import type { Metadata } from "next";

import { BackupSettings } from "@/features/settings/components/backup-settings";

export const metadata: Metadata = {
  title: "Configuración | PYL",
};

export default function ConfiguracionPage() {
  return <BackupSettings />;
}
