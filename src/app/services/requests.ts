import {IngredientGroupWithRelation} from './common.data';

export interface RecipeSearchRequest {
  includedIngredientGroups?: IngredientGroupWithRelation[];
  excludedIngredients?: number[];
  filterByName?: string;
  limit?: number;
  page?: number;
}
