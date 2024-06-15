import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
import isNil from 'lodash/isNil';
import { Repo, RepoFilters, entities } from '../../../../../libs/core';
import { TOKENS } from '../../lib/misc/di';
import { Dictionaries } from '../../entities/dictionaries';

@provide(TOKENS.IncomeTagRepo)
export class IncomeTagRepo implements Repo<entities.IncomeTag> {
  @inject(TOKENS.DictionariesStore)
  private dictionaries!: Dictionaries;

  async create(params: entities.IncomeTag) {
    this.dictionaries.addCategory({
      type: 'income',
      id: params.incomeId,
      tagId: params.tagId,
    });

    return params;
  }

  async removeOneBy(filters: RepoFilters<entities.IncomeTag>) {
    const matchingTag = await this.getOneBy(filters);

    if (!matchingTag) {
      return false;
    }

    this.dictionaries.removeCategory({
      type: 'income',
      id: matchingTag.incomeId,
      tagId: matchingTag.tagId,
    });

    return true;
  }

  async removeMany(filters: RepoFilters<entities.IncomeTag>) {
    const matchingTags = await this.getMany(filters);

    if (matchingTags.length === 0) {
      return false;
    }

    this.dictionaries.removeMany({
      type: 'income',
      id: matchingTags[0].incomeId,
      tagsIds: matchingTags.map((tag) => tag.tagId),
    });

    return true;
  }

  async getOneBy(filters: RepoFilters<entities.IncomeTag>) {
    const tags = await this.getAll();
    const matchingTag = tags.find((tag) => {
      const isIncomeIdEqual = isNil(filters.incomeId) || tag.incomeId === filters.incomeId;
      const isTagIdEqual = isNil(filters.tagId) || tag.tagId === filters.tagId;

      return isIncomeIdEqual && isTagIdEqual;
    });

    if (!matchingTag) {
      return null;
    }

    return matchingTag;
  }

  async getMany(filters: RepoFilters<entities.IncomeTag>) {
    const tags = await this.getAll();
    const matchingTags = tags.filter((tag) => {
      const isIncomeIdEqual = isNil(filters.incomeId) || tag.incomeId === filters.incomeId;
      const isTagIdEqual = isNil(filters.tagId) || tag.tagId === filters.tagId;

      return isIncomeIdEqual && isTagIdEqual;
    });

    return matchingTags;
  }

  async updateOneBy() {
    return null;
  }

  async updateMany() {
    return null;
  }

  async getAll() {
    return this.dictionaries.getAllByCategory('income');
  }
}