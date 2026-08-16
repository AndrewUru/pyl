import { describe, expect, it } from "vitest";

import {
  PartitionValidationError,
  calculateBoardArea,
  calculateBoardCount,
  calculateGrossArea,
  calculateInsulationArea,
  calculateNetArea,
  calculateOpeningsArea,
  calculatePartition,
  calculateStudCount,
  calculateTrackLength,
  validatePartitionInput,
  type PartitionCalculationInput,
} from "./partition";

const validInput: PartitionCalculationInput = {
  length: 4,
  height: 2.5,
  openings: [
    { type: "door", width: 0.9, height: 2.1, quantity: 1 },
    { type: "window", width: 1.2, height: 1, quantity: 2 },
  ],
  boardsPerFace: 2,
  boardWidth: 1.2,
  boardHeight: 2.5,
  studSpacing: 0.6,
  wastePercentage: 10,
  hasInsulation: true,
};

describe("funciones geométricas de tabiques", () => {
  it("calcula superficies bruta, de huecos y neta", () => {
    const grossArea = calculateGrossArea(4, 2.5);
    const openingsArea = calculateOpeningsArea(validInput.openings);

    expect(grossArea).toBe(10);
    expect(openingsArea).toBeCloseTo(4.29);
    expect(calculateNetArea(grossArea, openingsArea)).toBeCloseTo(5.71);
  });

  it("calcula placa para ambas caras, capas y merma", () => {
    expect(calculateBoardArea(5.71, 2, 10)).toBeCloseTo(25.124);
    expect(calculateBoardCount(25.124, 1.2, 2.5)).toBe(9);
  });

  it("calcula canales y montantes como estimación geométrica base", () => {
    expect(calculateTrackLength(4)).toBe(8);
    expect(calculateStudCount(4, 0.6)).toBe(8);
  });

  it("sólo devuelve aislamiento cuando el sistema lo incluye", () => {
    expect(calculateInsulationArea(5.71, true)).toBe(5.71);
    expect(calculateInsulationArea(5.71, false)).toBe(0);
  });
});

describe("calculatePartition", () => {
  it("compone un resultado completo y consistente", () => {
    const result = calculatePartition(validInput);

    expect(result).toEqual(
      expect.objectContaining({
        boardCount: 9,
        studCount: 8,
        trackLength: 8,
        wastePercentage: 10,
      }),
    );
    expect(result.grossArea).toBe(10);
    expect(result.openingsArea).toBeCloseTo(4.29);
    expect(result.netArea).toBeCloseTo(5.71);
    expect(result.boardAreaBeforeWaste).toBeCloseTo(22.84);
    expect(result.totalBoardArea).toBeCloseTo(25.124);
    expect(result.insulationArea).toBeCloseTo(5.71);
  });

  it("no modifica los datos de entrada", () => {
    const input = structuredClone(validInput);
    const snapshot = structuredClone(input);

    calculatePartition(input);

    expect(input).toEqual(snapshot);
  });
});

describe("validación del cálculo", () => {
  it("rechaza longitud o altura iguales a cero", () => {
    const issues = validatePartitionInput({
      ...validInput,
      length: 0,
      height: 0,
    });

    expect(issues.map((issue) => issue.path)).toEqual(
      expect.arrayContaining(["length", "height"]),
    );
  });

  it("rechaza valores negativos y cantidades no enteras", () => {
    const issues = validatePartitionInput({
      ...validInput,
      wastePercentage: -1,
      openings: [
        { type: "custom", width: -1, height: 1, quantity: 1.5 },
      ],
    });

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["must_be_non_negative", "must_be_positive", "must_be_integer"]),
    );
  });

  it("avisa cuando los huecos superan la superficie bruta", () => {
    const input: PartitionCalculationInput = {
      ...validInput,
      length: 1,
      height: 1,
      openings: [
        { type: "door", width: 1, height: 2, quantity: 1 },
      ],
    };

    expect(validatePartitionInput(input)).toContainEqual(
      expect.objectContaining({ code: "openings_exceed_gross_area" }),
    );
    expect(() => calculatePartition(input)).toThrowError(
      PartitionValidationError,
    );
  });

  it("rechaza porcentajes superiores al 100 %", () => {
    expect(
      validatePartitionInput({ ...validInput, wastePercentage: 101 }),
    ).toContainEqual(
      expect.objectContaining({ code: "percentage_out_of_range" }),
    );
  });
});
