import type { Metadata } from "next";

import { PartitionCalculator } from "@/features/calculations/components/partition-calculator";

export const metadata: Metadata = {
  title: "Calculadora de tabiques | PYL",
};

export default function CalculadoraPage() {
  return <PartitionCalculator />;
}
