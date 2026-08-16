"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeftOpen,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  isNavigationItemActive,
  mainNavigation,
  settingsNavigation,
  type NavigationItem,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  collapsed?: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
  onToggleCollapsed?: () => void;
  onClose?: () => void;
}

interface SidebarLinkProps {
  item: NavigationItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}

function SidebarLink({
  item,
  active,
  collapsed,
  onNavigate,
}: SidebarLinkProps) {
  const Icon: LucideIcon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group flex h-9 items-center rounded-md text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        collapsed ? "justify-center px-2" : "gap-3 px-2.5",
        active
          ? "bg-sidebar-accent text-white shadow-sidebar-active"
          : "text-sidebar-muted hover:bg-white/[0.055] hover:text-white",
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "size-[17px] shrink-0",
          active ? "text-white" : "text-sidebar-muted group-hover:text-white",
        )}
        strokeWidth={1.8}
      />
      <span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>
    </Link>
  );
}

export function AppSidebar({
  collapsed = false,
  mobile = false,
  onNavigate,
  onToggleCollapsed,
  onClose,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-r border-sidebar-border bg-sidebar text-white">
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-3" : "justify-between px-4",
        )}
      >
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          aria-label="Ir al inicio de PYL"
        >
          <span className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white text-[11px] font-bold tracking-[-0.03em] text-sidebar">
            P
          </span>
          {!collapsed ? (
            <span>
              <span className="block text-sm font-semibold tracking-[-0.02em]">
                PYL
              </span>
              <span className="block text-[10px] text-sidebar-muted">
                Technical workspace
              </span>
            </span>
          ) : null}
        </Link>
        {mobile ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar navegación"
            className="size-8 text-sidebar-muted hover:bg-white/10 hover:text-white focus-visible:ring-sidebar-ring focus-visible:ring-offset-sidebar"
            autoFocus
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        ) : null}
      </div>

      <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {mainNavigation.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              active={isNavigationItemActive(pathname, item.href)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <SidebarLink
          item={settingsNavigation}
          active={isNavigationItemActive(pathname, settingsNavigation.href)}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
        {!mobile ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
            className={cn(
              "mt-2 flex h-8 w-full items-center rounded-md text-xs text-sidebar-muted transition-colors hover:bg-white/[0.055] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              collapsed ? "justify-center" : "gap-3 px-2.5",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-4" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-4" />
            )}
            <span className={collapsed ? "sr-only" : undefined}>
              Contraer navegación
            </span>
          </button>
        ) : null}
      </div>
    </aside>
  );
}
