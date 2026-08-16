import "client-only";

import { createCalculationsService } from "@/features/calculations/calculation-service";
import { calculationsRepository } from "@/lib/db";

export const calculationsService = createCalculationsService(
  calculationsRepository,
);
