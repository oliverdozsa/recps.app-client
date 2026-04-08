import {IngredientGroupWithRelation} from './common.data';

export interface IngredientSearchRequest {
  query: string;
  languageId: number;
}

export interface RecipeSearchRequest {
  includedIngredientGroups?: IngredientGroupWithRelation[];
  excludedIngredients?: number[];
  filterByName?: string;
  limit: number;
  page?: number;
}
