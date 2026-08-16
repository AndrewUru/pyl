import { describe, expect, it } from "vitest";

import { calculatePartition } from "@/domain/calculations";

import { parseBackupJson, validateBackupDocument } from "./backup-validation";
import type { PylBackupDocument } from "./backup-types";

const timestamp = "2026-08-16T18:00:00.000Z";
const partitionInput = {
  length: 4,
  height: 2.6,
  openings: [],
  boardsPerFace: 1,
  boardWidth: 1.2,
  boardHeight: 2.6,
  studSpacing: 0.6,
  wastePercentage: 10,
  hasInsulation: true,
} as const;

const validBackup: PylBackupDocument = {
  version: 1,
  app: "PYL",
  exportedAt: timestamp,
  data: {
    projects: [
      {
        id: "project-1",
        name: "Proyecto de prueba",
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    clients: [
      {
        id: "client-1",
        name: "Cliente de prueba",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    budgets: [
      {
        id: "budget-1",
        name: "Presupuesto de prueba",
        items: [
          {
            id: "item-1",
            description: "Partida",
            quantity: 1,
            unit: "m²",
            unitPrice: 1000,
            total: 1000,
          },
        ],
        subtotal: 1000,
        margin: 100,
        tax: 231,
        total: 1331,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    calculations: [
      {
        id: "calculation-1",
        type: "partition",
        input: { ...partitionInput, openings: [] },
        result: calculatePartition({ ...partitionInput, openings: [] }),
        createdAt: timestamp,
      },
    ],
    settings: [
      {
        id: "settings-1",
        companyName: "PYL",
        defaultWastePercentage: 10,
        defaultMargin: 15,
        taxRate: 21,
      },
    ],
  },
};

describe("validación de copias de seguridad", () => {
  it("acepta y resume un backup completo válido", () => {
    const result = parseBackupJson(JSON.stringify(validBackup));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary).toEqual({
        projects: 1,
        clients: 1,
        budgets: 1,
        calculations: 1,
        settings: 1,
      });
    }
  });

  it("rechaza JSON dañado y versiones incompatibles", () => {
    expect(parseBackupJson("{no-json").success).toBe(false);
    expect(
      validateBackupDocument({ ...validBackup, version: 2 }).success,
    ).toBe(false);
  });

  it("rechaza una estructura incompleta", () => {
    const result = validateBackupDocument({
      version: 1,
      app: "PYL",
      exportedAt: timestamp,
      data: { projects: [] },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("data.clients"),
          expect.stringContaining("data.budgets"),
        ]),
      );
    }
  });

  it("rechaza fechas imposibles e identificadores duplicados", () => {
    const backup = structuredClone(validBackup);
    backup.exportedAt = "2026-02-30T18:00:00.000Z";
    backup.data.projects.push(structuredClone(backup.data.projects[0]));

    const result = validateBackupDocument(backup);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("exportedAt"),
          expect.stringContaining("duplicado"),
        ]),
      );
    }
  });

  it("rechaza resultados matemáticos manipulados", () => {
    const backup = structuredClone(validBackup);
    const calculation = backup.data.calculations[0];
    if (calculation && "grossArea" in calculation.result) {
      calculation.result.grossArea = 999;
    }

    const result = validateBackupDocument(backup);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain(
        "data.calculations[0].result.grossArea no coincide con los datos de entrada.",
      );
    }
  });

  it("rechaza claves JSON peligrosas", () => {
    const dangerousInput = JSON.parse(
      '{"__proto__":{"polluted":true}}',
    ) as unknown;
    const backup = {
      version: 1,
      app: "PYL",
      exportedAt: timestamp,
      data: {
        projects: [],
        clients: [],
        budgets: [],
        calculations: [
          {
            id: "calculation-1",
            type: "future-calculation",
            input: dangerousInput,
            result: {},
            createdAt: timestamp,
          },
        ],
        settings: [],
      },
    };

    const result = validateBackupDocument(backup);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain("clave no permitida");
    }
  });
});
