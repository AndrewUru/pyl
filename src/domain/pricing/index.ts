export type MoneyInCents = number;
export type Percentage = number;

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: MoneyInCents;
  total: MoneyInCents;
  materialId?: string;
}
