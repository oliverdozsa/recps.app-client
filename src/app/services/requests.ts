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

export interface IngredientCategoryByIdsRequest {
  ids: number[];
  languageId: number;
}

export type RecipeOrderBy = 'prepTime' | 'ingredientCount';
export type RecipeOrderDirection = 'asc' | 'desc';

export interface PrepTime {
  min?: number;
  max?: number;
}

export interface CountIngredients {
  min?: number;
  max?: number;
}

export interface RecipeSearchRequest {
  includedIngredientGroups?: IngredientGroupWithRelation[];
  excludedIngredients?: number[];
  filterByName?: string;
  ingredientLanguageId: number;
  limit: number;
  page?: number;
  orderBy?: RecipeOrderBy;
  orderDirection?: RecipeOrderDirection;
  prepTime?: PrepTime;
  countIngredients?: CountIngredients;
}
