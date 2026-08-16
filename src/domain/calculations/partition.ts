export const OPENING_TYPES = ["door", "window", "custom"] as const;

export type OpeningType = (typeof OPENING_TYPES)[number];

export interface PartitionOpening {
  type: OpeningType;
  width: number;
  height: number;
  quantity: number;
}

export interface PartitionCalculationInput {
  length: number;
  height: number;
  openings: PartitionOpening[];
  boardsPerFace: number;
  boardWidth: number;
  boardHeight: number;
  studSpacing: number;
  wastePercentage: number;
  hasInsulation: boolean;
}

export interface PartitionCalculationResult {
  grossArea: number;
  openingsArea: number;
  netArea: number;
  boardAreaBeforeWaste: number;
  totalBoardArea: number;
  boardCount: number;
  trackLength: number;
  studCount: number;
  insulationArea: number;
  wastePercentage: number;
}

export type PartitionValidationCode =
  | "not_finite"
  | "must_be_positive"
  | "must_be_non_negative"
  | "must_be_integer"
  | "percentage_out_of_range"
  | "openings_exceed_gross_area";

export interface PartitionValidationIssue {
  path: string;
  code: PartitionValidationCode;
  message: string;
}

export class PartitionValidationError extends Error {
  readonly issues: PartitionValidationIssue[];

  constructor(issues: PartitionValidationIssue[]) {
    super(issues[0]?.message ?? "Los datos del cálculo no son válidos.");
    this.name = "PartitionValidationError";
    this.issues = issues;
  }
}

function positiveNumberIssue(
  value: number,
  path: string,
  label: string,
): PartitionValidationIssue | null {
  if (!Number.isFinite(value)) {
    return {
      path,
      code: "not_finite",
      message: `${label} debe ser un número válido.`,
    };
  }

  if (value <= 0) {
    return {
      path,
      code: "must_be_positive",
      message: `${label} debe ser mayor que cero.`,
    };
  }

  return null;
}

function nonNegativeNumberIssue(
  value: number,
  path: string,
  label: string,
): PartitionValidationIssue | null {
  if (!Number.isFinite(value)) {
    return {
      path,
      code: "not_finite",
      message: `${label} debe ser un número válido.`,
    };
  }

  if (value < 0) {
    return {
      path,
      code: "must_be_non_negative",
      message: `${label} no puede ser negativo.`,
    };
  }

  return null;
}

function assertValid(issues: Array<PartitionValidationIssue | null>): void {
  const validationIssues = issues.filter(
    (issue): issue is PartitionValidationIssue => issue !== null,
  );

  if (validationIssues.length) {
    throw new PartitionValidationError(validationIssues);
  }
}

function validateOpenings(openings: PartitionOpening[]): PartitionValidationIssue[] {
  const issues: PartitionValidationIssue[] = [];

  openings.forEach((opening, index) => {
    const prefix = `openings.${index}`;
    const widthIssue = positiveNumberIssue(
      opening.width,
      `${prefix}.width`,
      `El ancho del hueco ${index + 1}`,
    );
    const heightIssue = positiveNumberIssue(
      opening.height,
      `${prefix}.height`,
      `El alto del hueco ${index + 1}`,
    );
    const quantityIssue = positiveNumberIssue(
      opening.quantity,
      `${prefix}.quantity`,
      `La cantidad del hueco ${index + 1}`,
    );

    if (widthIssue) issues.push(widthIssue);
    if (heightIssue) issues.push(heightIssue);
    if (quantityIssue) issues.push(quantityIssue);

    if (!quantityIssue && !Number.isInteger(opening.quantity)) {
      issues.push({
        path: `${prefix}.quantity`,
        code: "must_be_integer",
        message: `La cantidad del hueco ${index + 1} debe ser un número entero.`,
      });
    }
  });

  return issues;
}

export function validatePartitionInput(
  input: PartitionCalculationInput,
): PartitionValidationIssue[] {
  const issues: PartitionValidationIssue[] = [];
  const baseIssues = [
    positiveNumberIssue(input.length, "length", "La longitud"),
    positiveNumberIssue(input.height, "height", "La altura"),
    positiveNumberIssue(
      input.boardsPerFace,
      "boardsPerFace",
      "El número de placas por cara",
    ),
    positiveNumberIssue(input.boardWidth, "boardWidth", "El ancho de placa"),
    positiveNumberIssue(input.boardHeight, "boardHeight", "El alto de placa"),
    positiveNumberIssue(
      input.studSpacing,
      "studSpacing",
      "La separación entre montantes",
    ),
    nonNegativeNumberIssue(
      input.wastePercentage,
      "wastePercentage",
      "El porcentaje de merma",
    ),
  ];

  baseIssues.forEach((issue) => {
    if (issue) issues.push(issue);
  });

  if (
    Number.isFinite(input.boardsPerFace) &&
    input.boardsPerFace > 0 &&
    !Number.isInteger(input.boardsPerFace)
  ) {
    issues.push({
      path: "boardsPerFace",
      code: "must_be_integer",
      message: "El número de placas por cara debe ser un número entero.",
    });
  }

  if (
    Number.isFinite(input.wastePercentage) &&
    input.wastePercentage > 100
  ) {
    issues.push({
      path: "wastePercentage",
      code: "percentage_out_of_range",
      message: "El porcentaje de merma no puede superar el 100 %.",
    });
  }

  const openingIssues = validateOpenings(input.openings);
  issues.push(...openingIssues);

  const canCompareAreas =
    !positiveNumberIssue(input.length, "length", "La longitud") &&
    !positiveNumberIssue(input.height, "height", "La altura") &&
    openingIssues.length === 0;

  if (canCompareAreas) {
    const grossArea = input.length * input.height;
    const openingsArea = input.openings.reduce(
      (total, opening) =>
        total + opening.width * opening.height * opening.quantity,
      0,
    );

    if (openingsArea > grossArea) {
      issues.push({
        path: "openings",
        code: "openings_exceed_gross_area",
        message:
          "La superficie de los huecos no puede superar la superficie bruta del tabique.",
      });
    }
  }

  return issues;
}

export function calculateGrossArea(length: number, height: number): number {
  assertValid([
    positiveNumberIssue(length, "length", "La longitud"),
    positiveNumberIssue(height, "height", "La altura"),
  ]);
  return length * height;
}

export function calculateOpeningsArea(openings: PartitionOpening[]): number {
  const issues = validateOpenings(openings);
  if (issues.length) {
    throw new PartitionValidationError(issues);
  }

  return openings.reduce(
    (total, opening) =>
      total + opening.width * opening.height * opening.quantity,
    0,
  );
}

export function calculateNetArea(
  grossArea: number,
  openingsArea: number,
): number {
  const issues: Array<PartitionValidationIssue | null> = [
    nonNegativeNumberIssue(grossArea, "grossArea", "La superficie bruta"),
    nonNegativeNumberIssue(
      openingsArea,
      "openingsArea",
      "La superficie de huecos",
    ),
  ];

  if (
    Number.isFinite(grossArea) &&
    Number.isFinite(openingsArea) &&
    openingsArea > grossArea
  ) {
    issues.push({
      path: "openingsArea",
      code: "openings_exceed_gross_area",
      message:
        "La superficie de los huecos no puede superar la superficie bruta del tabique.",
    });
  }

  assertValid(issues);
  return grossArea - openingsArea;
}

export function calculateBoardArea(
  netArea: number,
  boardsPerFace: number,
  wastePercentage: number,
): number {
  const issues: Array<PartitionValidationIssue | null> = [
    nonNegativeNumberIssue(netArea, "netArea", "La superficie neta"),
    positiveNumberIssue(
      boardsPerFace,
      "boardsPerFace",
      "El número de placas por cara",
    ),
    nonNegativeNumberIssue(
      wastePercentage,
      "wastePercentage",
      "El porcentaje de merma",
    ),
  ];

  if (
    Number.isFinite(boardsPerFace) &&
    boardsPerFace > 0 &&
    !Number.isInteger(boardsPerFace)
  ) {
    issues.push({
      path: "boardsPerFace",
      code: "must_be_integer",
      message: "El número de placas por cara debe ser un número entero.",
    });
  }

  if (Number.isFinite(wastePercentage) && wastePercentage > 100) {
    issues.push({
      path: "wastePercentage",
      code: "percentage_out_of_range",
      message: "El porcentaje de merma no puede superar el 100 %.",
    });
  }

  assertValid(issues);
  return netArea * 2 * boardsPerFace * (1 + wastePercentage / 100);
}

export function calculateBoardCount(
  totalBoardArea: number,
  boardWidth: number,
  boardHeight: number,
): number {
  assertValid([
    nonNegativeNumberIssue(
      totalBoardArea,
      "totalBoardArea",
      "La superficie total de placa",
    ),
    positiveNumberIssue(boardWidth, "boardWidth", "El ancho de placa"),
    positiveNumberIssue(boardHeight, "boardHeight", "El alto de placa"),
  ]);

  return Math.ceil(totalBoardArea / (boardWidth * boardHeight));
}

export function calculateStudCount(
  length: number,
  studSpacing: number,
): number {
  assertValid([
    positiveNumberIssue(length, "length", "La longitud"),
    positiveNumberIssue(
      studSpacing,
      "studSpacing",
      "La separación entre montantes",
    ),
  ]);

  return Math.ceil(length / studSpacing) + 1;
}

export function calculateTrackLength(length: number): number {
  assertValid([positiveNumberIssue(length, "length", "La longitud")]);
  return length * 2;
}

export function calculateInsulationArea(
  netArea: number,
  hasInsulation: boolean,
): number {
  assertValid([
    nonNegativeNumberIssue(netArea, "netArea", "La superficie neta"),
  ]);
  return hasInsulation ? netArea : 0;
}

export function calculatePartition(
  input: PartitionCalculationInput,
): PartitionCalculationResult {
  const issues = validatePartitionInput(input);
  if (issues.length) {
    throw new PartitionValidationError(issues);
  }

  const grossArea = calculateGrossArea(input.length, input.height);
  const openingsArea = calculateOpeningsArea(input.openings);
  const netArea = calculateNetArea(grossArea, openingsArea);
  const boardAreaBeforeWaste = calculateBoardArea(
    netArea,
    input.boardsPerFace,
    0,
  );
  const totalBoardArea = calculateBoardArea(
    netArea,
    input.boardsPerFace,
    input.wastePercentage,
  );

  return {
    grossArea,
    openingsArea,
    netArea,
    boardAreaBeforeWaste,
    totalBoardArea,
    boardCount: calculateBoardCount(
      totalBoardArea,
      input.boardWidth,
      input.boardHeight,
    ),
    trackLength: calculateTrackLength(input.length),
    studCount: calculateStudCount(input.length, input.studSpacing),
    insulationArea: calculateInsulationArea(netArea, input.hasInsulation),
    wastePercentage: input.wastePercentage,
  };
}
