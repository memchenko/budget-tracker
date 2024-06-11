import { inject } from 'inversify';
import { assert } from 'ts-essentials';

import { Tag } from '../../entities/Tag';
import { IncomeTag } from '../../entities/IncomeTag';
import { TYPES } from '../../types';
import { Repo } from '../../shared/types';
import { BaseScenario } from '../BaseScenario';
import { ScenarioError } from '../../errors/ScenarioError';
import { UNKNOWN_ERROR_TEXT } from '../../shared/constants';

const DELETE_INCOME_TAGS_ERROR = "Couldn't delete income tags";
const DELETE_TAG_ERROR = "Couldn't delete a tag";

export interface DeleteIncomeTagParams {
  tagId: Tag['id'];
}

export class DeleteIncomeTag extends BaseScenario<DeleteIncomeTagParams> {
  @inject(TYPES.TagRepo)
  private readonly tagRepo!: Repo<Tag, 'id'>;

  @inject(TYPES.IncomeTagRepo)
  private readonly incomeTagRepo!: Repo<IncomeTag>;

  private initialIncomeTags: IncomeTag[] = [];

  async execute() {
    this.initialIncomeTags = await this.incomeTagRepo.getMany({ tagId: this.params.tagId });

    const isIncomeTagsDeleted = await this.incomeTagRepo.removeMany({ tagId: this.params.tagId });
    assert(isIncomeTagsDeleted, DELETE_INCOME_TAGS_ERROR);

    const isTagDeleted = await this.tagRepo.removeOneBy({ id: this.params.tagId });
    assert(isTagDeleted, DELETE_TAG_ERROR);
  }

  async revert() {
    assert(this.error instanceof ScenarioError, UNKNOWN_ERROR_TEXT);

    if (this.error.message === DELETE_TAG_ERROR) {
      const incomeTags = this.initialIncomeTags.map((incomeTag) => this.incomeTagRepo.create(incomeTag));
      await Promise.all(incomeTags);
    }
  }
}