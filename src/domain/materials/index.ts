export type MaterialUnit = "unit" | "m" | "m2" | "kg" | "l";

export interface MaterialReference {
  id: string;
  name: string;
  unit: MaterialUnit;
}
