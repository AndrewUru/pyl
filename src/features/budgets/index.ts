import type { Budget } from "@/types/entities";
import type { Repository } from "@/types/repository";

export type CreateBudgetInput = Omit<
  Budget,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateBudgetInput = Partial<CreateBudgetInput>;

export type BudgetsRepository = Repository<
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput
>;
