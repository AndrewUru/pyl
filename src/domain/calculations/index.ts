import type { JsonObject } from "@/types/json";

export {
  OPENING_TYPES,
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
} from "./partition";
export type {
  OpeningType,
  PartitionCalculationInput,
  PartitionCalculationResult,
  PartitionOpening,
  PartitionValidationCode,
  PartitionValidationIssue,
} from "./partition";

import type {
  PartitionCalculationInput,
  PartitionCalculationResult,
} from "./partition";

export type CalculationInput = PartitionCalculationInput | JsonObject;
export type CalculationResult = PartitionCalculationResult | JsonObject;
