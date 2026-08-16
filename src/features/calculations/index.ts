import type { Calculation } from "@/types/entities";
import type { Repository } from "@/types/repository";

export type CreateCalculationInput = Omit<Calculation, "id" | "createdAt">;
export type UpdateCalculationInput = Partial<CreateCalculationInput>;

export type CalculationsRepository = Repository<
  Calculation,
  CreateCalculationInput,
  UpdateCalculationInput
>;
