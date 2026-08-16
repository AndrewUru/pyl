import type { IsoDateString } from "@/types/entities";

export function nowIso(): IsoDateString {
  return new Date().toISOString();
}
