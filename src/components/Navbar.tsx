"use client";

import Link from "next/link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/calculadora", label: "Calculadora" },
  { href: "/presupuestos", label: "Presupuestos" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/clientes", label: "Clientes" },
  { href: "/guias", label: "Guías" },
];

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 flex gap-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="hover:text-yellow-400 transition"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
