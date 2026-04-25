import {Ingredient} from './common.data';

export interface RecipeSearchResponse {
  id?: number;
  name?: string;
  url?: string;
  imageUrl?: string;
  ingredients: Ingredient[];
  cookingTime?: number;
  sourcePage?: string;
}

export interface PageResponseRecipeSearchResponse {
  items?: RecipeSearchResponse[];
  totalCount?: number;
}

export interface LanguageResponse {
  id?: number;
  isoName?: string;
}

export interface IngredientSearchResponse {
  ingredientId: number;
  name: string;
  alternatives?: string[];
}

export interface IngredientCategorySearchResponse {
  id: number;
  name: string;
  ingredientIds: number[];
}

export interface IngredientSearchAndCategoryUnion {
  ingredient?: IngredientSearchResponse,
  category?: IngredientCategorySearchResponse
}

export function unionName(u: IngredientSearchAndCategoryUnion): string {
  return u.ingredient?.name ?? u.category?.name ?? '';
}

export function unionIds(u: IngredientSearchAndCategoryUnion): number[] {
  if (u.ingredient) return [u.ingredient.ingredientId];
  return u.category?.ingredientIds ?? [];
}

export function unionKey(u: IngredientSearchAndCategoryUnion): string {
  return u.ingredient ? `i:${u.ingredient.ingredientId}` : `c:${u.category?.id}`;
}

export function isCategory(u: IngredientSearchAndCategoryUnion): boolean {
  return u.category !== undefined;
}
