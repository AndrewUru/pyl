export type PylSystemCategory = "partition" | "lining" | "ceiling";

export interface PylSystemReference {
  id: string;
  name: string;
  category: PylSystemCategory;
}
