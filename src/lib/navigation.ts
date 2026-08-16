import {
  BookOpen,
  Calculator,
  FolderKanban,
  LayoutDashboard,
  PackageSearch,
  ReceiptText,
  Settings2,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const mainNavigation: NavigationItem[] = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/proyectos", label: "Proyectos", icon: FolderKanban },
  { href: "/calculadora", label: "Calculadora", icon: Calculator },
  { href: "/presupuestos", label: "Presupuestos", icon: ReceiptText },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/materiales", label: "Materiales", icon: PackageSearch },
  { href: "/guias", label: "Guías", icon: BookOpen },
];

export const settingsNavigation: NavigationItem = {
  href: "/configuracion",
  label: "Configuración",
  icon: Settings2,
};

export function isNavigationItemActive(
  pathname: string,
  href: string,
): boolean {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function getCurrentNavigationItem(pathname: string): NavigationItem {
  return (
    [...mainNavigation, settingsNavigation].find((item) =>
      isNavigationItemActive(pathname, item.href),
    ) ?? mainNavigation[0]
  );
}
