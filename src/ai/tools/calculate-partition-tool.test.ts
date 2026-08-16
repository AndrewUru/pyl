import { describe, expect, it } from "vitest";

import { calculatePartition } from "@/domain/calculations";
import {
  runPartitionCalculation,
  type PartitionToolInput,
} from "@/ai/tools/calculate-partition-tool";

const validInput: PartitionToolInput = {
  length: 5,
  height: 2.6,
  openings: [],
  boardsPerFace: 2,
  boardWidth: 1.2,
  boardHeight: 2.6,
  studSpacing: 0.6,
  wastePercentage: 10,
  hasInsulation: true,
};

describe("runPartitionCalculation", () => {
  it("delega el resultado al mismo motor que la calculadora manual", () => {
    const output = runPartitionCalculation(validInput);

    expect(output).toEqual({
      ok: true,
      input: validInput,
      result: calculatePartition(validInput),
    });
  });

  it("devuelve errores de dominio estructurados sin inventar un resultado", () => {
    const output = runPartitionCalculation({
      ...validInput,
      openings: [
        { type: "door", width: 6, height: 3, quantity: 1 },
      ],
    });

    expect(output.ok).toBe(false);
    if (!output.ok) {
      expect(output.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: "openings_exceed_gross_area" }),
        ]),
      );
    }
  });
});
