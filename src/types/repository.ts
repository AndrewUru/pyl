export interface Repository<TEntity, TCreate, TUpdate> {
  list(): Promise<TEntity[]>;
  getById(id: string): Promise<TEntity | undefined>;
  create(input: TCreate): Promise<TEntity>;
  update(id: string, changes: TUpdate): Promise<TEntity>;
  delete(id: string): Promise<void>;
}
