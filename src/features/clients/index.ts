import type { Client } from "@/types/entities";
import type { Repository } from "@/types/repository";

export type CreateClientInput = Omit<
  Client,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateClientInput = Partial<CreateClientInput>;

export type ClientsRepository = Repository<
  Client,
  CreateClientInput,
  UpdateClientInput
>;
