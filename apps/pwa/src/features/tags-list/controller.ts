import { makeAutoObservable, action, computed } from 'mobx';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
import { Tag, EntityType } from '../../entities/tag';
import { User } from '../../entities/user';
import { TOKENS } from '../../lib/app/di';
import { ScenarioRunner } from '../../services/scenarioRunner';
import { assert } from 'ts-essentials';

@provide(TagsListController)
export class TagsListController {
  type?: 'cost' | 'income';
  selectedTags: EntityType[] = [];
  searchQuery = '';

  constructor(
    @inject(TOKENS.TagStore) private tag: Tag,
    @inject(TOKENS.UserStore) private user: User,
    @inject(ScenarioRunner) private scenarioRunner: ScenarioRunner,
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get shouldDisplayCreateTagButton() {
    assert(this.type, 'Type of tags is not defined');

    return this.searchQuery.length > 0 && !this.tag.hasTag(this.searchQuery, this.type);
  }

  get mostPopularTags() {
    assert(this.type, 'Type of tags is not defined');

    const popularTags = this.tag.getMostPopularTags(this.type);

    return popularTags.length > 0 ? popularTags : this.allTags.slice(0, 5);
  }

  @computed
  get allTags() {
    assert(this.type, 'Type of tags is not defined');

    return this.tag.getAllByType(this.type).filter((tag) => {
      return !this.selectedTags.some((selectedTag) => selectedTag.id === tag.id);
    });
  }

  getTagById(id: EntityType['id']) {
    return this.tag.getOneById(id);
  }

  @action
  handleCreateTagClick() {
    assert(this.type, 'Type of tags is not defined');

    const userId = this.user.current.id;

    this.scenarioRunner.execute({
      scenario: 'CreateTag',
      payload: { userId, title: this.searchQuery, type: this.type },
    });
  }

  @action
  handleSearchQueryChange(query: string) {
    this.searchQuery = query;
  }
}
