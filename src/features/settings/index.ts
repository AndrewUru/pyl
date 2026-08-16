import type { Settings } from "@/types/entities";
import type { Repository } from "@/types/repository";

export type CreateSettingsInput = Omit<Settings, "id">;
export type UpdateSettingsInput = Partial<CreateSettingsInput>;

export type SettingsRepository = Repository<
  Settings,
  CreateSettingsInput,
  UpdateSettingsInput
>;
