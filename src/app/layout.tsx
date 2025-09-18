import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "PYL Calculator",
  description: "Gestión de proyectos y cálculos para Placa de Yeso Laminado",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-100 text-gray-900">
        <Navbar />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
