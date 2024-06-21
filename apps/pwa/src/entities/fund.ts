import { makeAutoObservable, observable, action, computed } from 'mobx';
import { makePersistable, isHydrated } from 'mobx-persist-store';
import { entities } from '../../../../libs/core';
import { injectable } from 'inversify';

export type EntityType = entities.Fund & {
  createdAt: number;
  updatedAt: number;
};

@injectable()
export class Fund {
  @observable entries: EntityType[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    makePersistable(this, {
      name: this.constructor.name,
      properties: ['entries'],
    });
  }

  @action
  add(entity: EntityType) {
    this.entries.push(entity);
  }

  @action
  remove(id: EntityType['id']) {
    this.entries = this.entries.filter((entry) => entry.id !== id);
  }

  @action
  removeMany(ids: EntityType['id'][]) {
    this.entries = this.entries.filter((entry) => !ids.includes(entry.id));
  }

  @action
  update(updatedEntity: EntityType) {
    this.entries = this.entries.map((entry) => (entry.id === updatedEntity.id ? updatedEntity : entry));
  }

  @action
  updateMany(updatedEntities: EntityType[]) {
    updatedEntities.forEach((updatedEntity) => {
      this.entries = this.entries.map((entry) => (entry.id === updatedEntity.id ? updatedEntity : entry));
    });
  }

  @computed
  get mainFund() {
    return this.entries.find((entry) => entry.isMain) ?? null;
  }

  @computed
  get mainFundBalance() {
    return this.mainFund?.balance ?? null;
  }

  @computed
  get hasFunds() {
    return this.entries.filter(({ isMain }) => !isMain).length > 0;
  }

  @computed
  get isReady() {
    return isHydrated(this);
  }

  getAll() {
    return this.entries;
  }
}
