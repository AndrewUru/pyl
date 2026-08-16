"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Search, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { mainNavigation, settingsNavigation } from "@/lib/navigation";

interface CommandMenuProps {
  open: boolean;
  onClose: () => void;
}

const commandItems = [...mainNavigation, settingsNavigation];

export function CommandMenu({ open, onClose }: CommandMenuProps) {
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const filteredItems = commandItems.filter((item) =>
    item.label.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")),
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  function keepFocusInside(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }

    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled])',
      ),
    );
    const first = focusable[0];
    const last = focusable.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[12vh] sm:px-6">
      <div
        className="absolute inset-0 bg-black/45"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-menu-title"
        onKeyDown={keepFocusInside}
        className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface shadow-command"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search aria-hidden="true" className="size-4 text-muted-foreground" />
          <label htmlFor="global-command" className="sr-only">
            Buscar sección
          </label>
          <input
            id="global-command"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar una sección..."
            className="h-13 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar buscador"
            className="size-8"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          <p id="command-menu-title" className="px-2 py-2 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Navegación
          </p>
          {filteredItems.length ? (
            <div className="space-y-0.5">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="flex h-10 items-center gap-3 rounded-lg px-2.5 text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No se encontraron secciones.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-border bg-surface-muted/60 px-4 py-3 text-[11px] text-muted-foreground">
          <Sparkles aria-hidden="true" className="size-3.5" />
          PYL Copilot se incorporará aquí en una próxima fase.
        </div>
      </div>
    </div>
  );
}
