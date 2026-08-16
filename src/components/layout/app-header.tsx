import Link from "next/link";
import { Menu, Search, Settings2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  title: string;
  onOpenNavigation: () => void;
  onOpenCommand: () => void;
}

export function AppHeader({
  title,
  onOpenNavigation,
  onOpenCommand,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 px-3 backdrop-blur-sm sm:px-5 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenNavigation}
          aria-label="Abrir navegación"
          className="md:!hidden"
        >
          <Menu aria-hidden="true" className="size-[18px]" />
        </Button>
        <nav aria-label="Ruta actual" className="flex min-w-0 items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Workspace
          </span>
          <span aria-hidden="true" className="hidden text-border-strong sm:inline">
            /
          </span>
          <span className="truncate text-sm font-medium text-foreground">
            {title}
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="secondary"
          size="default"
          onClick={onOpenCommand}
          aria-label="Abrir búsqueda y comandos"
          className="min-w-44 justify-between text-muted-foreground max-sm:!hidden lg:min-w-56"
        >
          <span className="flex items-center gap-2">
            <Search aria-hidden="true" className="size-3.5" />
            Buscar
          </span>
          <kbd className="font-mono text-[10px] text-muted-foreground">⌘ K</kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenCommand}
          aria-label="Abrir búsqueda y comandos"
          className="sm:!hidden"
        >
          <Search aria-hidden="true" className="size-[18px]" />
        </Button>
        <Button
          variant="outline"
          size="default"
          disabled
          aria-label="PYL Copilot, próximamente"
          title="PYL Copilot estará disponible próximamente"
          className="max-sm:!hidden"
        >
          <Sparkles aria-hidden="true" className="size-3.5" />
          Copilot
        </Button>
        <Link
          href="/configuracion"
          aria-label="Abrir configuración"
          className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Settings2 aria-hidden="true" className="size-[18px]" />
        </Link>
      </div>
    </header>
  );
}
