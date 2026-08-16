"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandMenu } from "@/components/layout/command-menu";
import { getCurrentNavigationItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const currentItem = getCurrentNavigationItem(pathname);

  useEffect(() => {
    setMobileNavigationOpen(false);
    setCommandMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandMenuOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setCommandMenuOpen(false);
        setMobileNavigationOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, []);

  useEffect(() => {
    if (!mobileNavigationOpen && !commandMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavigationOpen, commandMenuOpen]);

  return (
    <div className="min-h-screen bg-background">
      <div
        aria-hidden={commandMenuOpen || undefined}
        inert={commandMenuOpen || undefined}
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden transition-[width] duration-200 md:block",
          sidebarCollapsed ? "w-20" : "w-60",
        )}
      >
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
        />
      </div>

      {mobileNavigationOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileNavigationOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navegación de PYL"
            className="relative h-full w-[min(17.5rem,calc(100vw-2.5rem))] shadow-command"
          >
            <AppSidebar
              mobile
              onNavigate={() => setMobileNavigationOpen(false)}
              onClose={() => setMobileNavigationOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div
        aria-hidden={mobileNavigationOpen || commandMenuOpen || undefined}
        inert={mobileNavigationOpen || commandMenuOpen || undefined}
        className={cn(
          "min-h-screen transition-[padding] duration-200",
          sidebarCollapsed ? "md:pl-20" : "md:pl-60",
        )}
      >
        <AppHeader
          title={currentItem.label}
          onOpenNavigation={() => setMobileNavigationOpen(true)}
          onOpenCommand={() => setCommandMenuOpen(true)}
        />
        <main className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          {children}
        </main>
      </div>

      <CommandMenu open={commandMenuOpen} onClose={() => setCommandMenuOpen(false)} />
    </div>
  );
}
