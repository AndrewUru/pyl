import { tool } from "ai";
import { z } from "zod";

import {
  OPENING_TYPES,
  PartitionValidationError,
  calculatePartition,
  type PartitionCalculationInput,
  type PartitionCalculationResult,
  type PartitionValidationIssue,
} from "@/domain/calculations";

const openingSchema = z.object({
  type: z.enum(OPENING_TYPES).describe("Tipo de hueco"),
  width: z.number().positive().describe("Ancho del hueco en metros"),
  height: z.number().positive().describe("Alto del hueco en metros"),
  quantity: z.number().int().positive().describe("Número de huecos iguales"),
});

export const partitionToolInputSchema = z.object({
  length: z.number().positive().describe("Longitud del tabique en metros"),
  height: z.number().positive().describe("Altura del tabique en metros"),
  openings: z.array(openingSchema).describe("Huecos del tabique; usa [] si no hay"),
  boardsPerFace: z
    .number()
    .int()
    .positive()
    .describe("Número de capas de placa en cada cara"),
  boardWidth: z.number().positive().describe("Ancho de cada placa en metros"),
  boardHeight: z.number().positive().describe("Alto de cada placa en metros"),
  studSpacing: z
    .number()
    .positive()
    .describe("Separación entre montantes en metros"),
  wastePercentage: z
    .number()
    .min(0)
    .max(100)
    .describe("Porcentaje de merma"),
  hasInsulation: z.boolean().describe("Si el tabique incluye aislamiento"),
});

export type PartitionToolInput = z.infer<typeof partitionToolInputSchema>;

export type PartitionToolOutput =
  | {
      ok: true;
      input: PartitionCalculationInput;
      result: PartitionCalculationResult;
    }
  | {
      ok: false;
      issues: PartitionValidationIssue[];
    };

export function runPartitionCalculation(
  input: PartitionToolInput,
): PartitionToolOutput {
  try {
    return {
      ok: true,
      input,
      result: calculatePartition(input),
    };
  } catch (error: unknown) {
    if (error instanceof PartitionValidationError) {
      return { ok: false, issues: error.issues };
    }

    throw error;
  }
}

export const calculatePartitionTool = tool({
  description:
    "Calcula un tabique PYL con el motor determinista de dominio. Úsala siempre para calcular superficies, placas, canales, montantes o aislamiento de un tabique.",
  inputSchema: partitionToolInputSchema,
  execute: async (input): Promise<PartitionToolOutput> =>
    runPartitionCalculation(input),
});
