import type {
  OpeningType,
  PartitionCalculationInput,
} from "@/domain/calculations";

export interface PartitionOpeningDraft {
  id: string;
  type: OpeningType;
  width: string;
  height: string;
  quantity: string;
}

export interface PartitionFormDraft {
  length: string;
  height: string;
  openings: PartitionOpeningDraft[];
  boardsPerFace: string;
  boardWidth: string;
  boardHeight: string;
  studSpacing: string;
  wastePercentage: string;
  hasInsulation: boolean;
}

let openingSequence = 0;

export function createOpeningDraft(
  type: OpeningType = "door",
): PartitionOpeningDraft {
  openingSequence += 1;
  return {
    id: `opening-${openingSequence}`,
    type,
    width: type === "door" ? "0.90" : "1.20",
    height: type === "door" ? "2.10" : "1.00",
    quantity: "1",
  };
}

export function createDefaultPartitionDraft(): PartitionFormDraft {
  return {
    length: "4.00",
    height: "2.60",
    openings: [],
    boardsPerFace: "1",
    boardWidth: "1.20",
    boardHeight: "2.60",
    studSpacing: "0.60",
    wastePercentage: "10",
    hasInsulation: true,
  };
}

function parseNumericValue(value: string): number {
  return value.trim() ? Number(value) : Number.NaN;
}

export function partitionDraftToInput(
  draft: PartitionFormDraft,
): PartitionCalculationInput {
  return {
    length: parseNumericValue(draft.length),
    height: parseNumericValue(draft.height),
    openings: draft.openings.map((opening) => ({
      type: opening.type,
      width: parseNumericValue(opening.width),
      height: parseNumericValue(opening.height),
      quantity: parseNumericValue(opening.quantity),
    })),
    boardsPerFace: parseNumericValue(draft.boardsPerFace),
    boardWidth: parseNumericValue(draft.boardWidth),
    boardHeight: parseNumericValue(draft.boardHeight),
    studSpacing: parseNumericValue(draft.studSpacing),
    wastePercentage: parseNumericValue(draft.wastePercentage),
    hasInsulation: draft.hasInsulation,
  };
}
