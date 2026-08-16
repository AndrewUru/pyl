import {
  calculatePartition,
  type PartitionCalculationInput,
} from "@/domain/calculations";
import type { Calculation } from "@/types/entities";

import type { CalculationsRepository } from ".";

export const PARTITION_CALCULATION_TYPE = "partition";

export interface SavePartitionCalculationInput {
  input: PartitionCalculationInput;
  projectId?: string;
}

export interface CalculationsService {
  savePartition(input: SavePartitionCalculationInput): Promise<Calculation>;
}

export function createCalculationsService(
  repository: CalculationsRepository,
): CalculationsService {
  return {
    savePartition({ input, projectId }) {
      const result = calculatePartition(input);
      return repository.create({
        type: PARTITION_CALCULATION_TYPE,
        input,
        result,
        ...(projectId ? { projectId } : {}),
      });
    },
  };
}
