import { inject, injectable } from 'inversify';
import uniqueId from 'lodash/uniqueId';
import capitalize from 'lodash/capitalize';
import { Repo, RepoFilters } from '../../../../../libs/core';
import { getOneByRepoFilters, getManyByRepoFilters } from './helpers';
import { TOKENS } from '../app/di';

export type Entity = {
  id: string;
  createdAt: number;
  updatedAt: number;
};

export type Store<E extends Entity> = {
  add: (entity: E) => void;
  remove: (id: string) => boolean;
  removeMany: (ids: string[]) => boolean;
  update: (entity: E) => void;
  updateMany: (entities: E[]) => void;
  getAll: () => E[];
};

export type RepoBuilderParams = {
  entityName: 'cost' | 'income' | 'tag' | 'fund' | 'user';
};

export const buildRepo = <E extends Entity = Entity>(params: RepoBuilderParams) => {
  const { entityName } = params;
  const storeTokenKey = `${capitalize(entityName)}Store` as keyof typeof TOKENS;
  const storeToken = TOKENS[storeTokenKey];

  @injectable()
  class RepoImpl implements Repo<E> {
    @inject(storeToken)
    private store!: Store<E>;

    async create(params: Omit<E, 'id'>) {
      const time = Date.now();
      const newEntity = {
        id: uniqueId(),
        ...params,
        createdAt: time,
        updatedAt: time,
      } as E;

      this.store.add(newEntity);

      return newEntity;
    }

    async removeOneBy(filters: RepoFilters<E>) {
      const entity = getOneByRepoFilters(await this.getAll(), filters);

      if (!entity) {
        return false;
      }

      this.store.remove(entity.id);

      return true;
    }

    async removeMany(filters: RepoFilters<E>) {
      const entities = getManyByRepoFilters(await this.getAll(), filters);

      if (!entities) {
        return false;
      }

      const ids = entities.map(({ id }) => id);
      this.store.removeMany(ids);

      return true;
    }

    async getOneBy(filters: RepoFilters<E>) {
      return getOneByRepoFilters(await this.getAll(), filters);
    }

    async getMany(filters: RepoFilters<E>) {
      return getManyByRepoFilters(await this.getAll(), filters) ?? [];
    }

    async getAll() {
      return this.store.getAll();
    }

    async updateOneBy(filters: RepoFilters<E>, values: Partial<Omit<E, 'id'>>) {
      const entity = getOneByRepoFilters(await this.getAll(), filters);

      if (!entity) {
        return null;
      }

      const newValue = {
        ...entity,
        ...values,
      };

      this.store.update(newValue);

      return newValue;
    }

    async updateMany(
      data: {
        filters: RepoFilters<E>;
        values: Partial<Omit<E, 'id'>>;
      }[],
    ) {
      const all = await this.getAll();
      const entitiesToUpdate = data
        .map(({ filters }) => {
          return getOneByRepoFilters(all, filters);
        })
        .filter((entity): entity is E => entity !== null);

      if (entitiesToUpdate.length === 0) {
        return null;
      }

      const newValues = (entitiesToUpdate as E[]).map((entity, index) => {
        return {
          ...entity,
          ...data[index].values,
        };
      });

      this.store.updateMany(newValues);

      return newValues;
    }
  }

  return RepoImpl;
};
