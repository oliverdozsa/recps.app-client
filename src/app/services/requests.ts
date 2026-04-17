import {IngredientGroupWithRelation} from './common.data';

export interface IngredientSearchRequest {
  query: string;
  languageId: number;
}

export interface IngredientsByIdsRequest {
  ids: number[];
  languageId: number;
}

export interface IngredientCategorySearchRequest {
  languageId: number;
  filterByName: string;
}

export interface RecipeSearchRequest {
  includedIngredientGroups?: IngredientGroupWithRelation[];
  excludedIngredients?: number[];
  filterByName?: string;
  ingredientLanguageId: number;
  limit: number;
  page?: number;
}
