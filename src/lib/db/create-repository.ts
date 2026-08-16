import "client-only";

import type { Table } from "dexie";

import type { Repository } from "@/types/repository";

import { getPylDatabase, type PylDatabase } from "./database";

interface IdentifiedEntity {
  id: string;
}

type TableSelector<TEntity extends IdentifiedEntity> = (
  database: PylDatabase,
) => Table<TEntity, string>;

export function createDexieRepository<
  TEntity extends IdentifiedEntity,
  TCreate,
  TUpdate,
>(
  selectTable: TableSelector<TEntity>,
  createEntity: (input: TCreate) => TEntity,
  updateEntity: (current: TEntity, changes: TUpdate) => TEntity,
): Repository<TEntity, TCreate, TUpdate> {
  const table = () => selectTable(getPylDatabase());

  return {
    list: () => table().toArray(),
    getById: (id) => table().get(id),
    async create(input) {
      const entity = createEntity(input);
      await table().add(entity);
      return entity;
    },
    async update(id, changes) {
      const current = await table().get(id);

      if (!current) {
        throw new Error(`Entity with id "${id}" was not found.`);
      }

      const entity = updateEntity(current, changes);
      await table().put(entity);
      return entity;
    },
    async delete(id) {
      await table().delete(id);
    },
  };
}
