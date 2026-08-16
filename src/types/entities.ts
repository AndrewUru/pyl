import type {
  CalculationInput,
  CalculationResult,
} from "@/domain/calculations";
import type {
  BudgetItem,
  MoneyInCents,
  Percentage,
} from "@/domain/pricing";

export type EntityId = string;
export type IsoDateString = string;

export type ProjectStatus =
  | "pending"
  | "in_progress"
  | "delivered"
  | "archived";

export interface Project {
  id: EntityId;
  name: string;
  description?: string;
  clientId?: EntityId;
  status: ProjectStatus;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

export interface Client {
  id: EntityId;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

export interface Budget {
  id: EntityId;
  projectId?: EntityId;
  clientId?: EntityId;
  name: string;
  items: BudgetItem[];
  subtotal: MoneyInCents;
  margin: MoneyInCents;
  tax: MoneyInCents;
  total: MoneyInCents;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

export interface Calculation {
  id: EntityId;
  projectId?: EntityId;
  type: string;
  input: CalculationInput;
  result: CalculationResult;
  createdAt: IsoDateString;
}

export interface Settings {
  id: EntityId;
  companyName: string;
  defaultWastePercentage: Percentage;
  defaultMargin: Percentage;
  taxRate: Percentage;
}
