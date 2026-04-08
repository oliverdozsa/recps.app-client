import {Ingredient} from './common.data';

export interface RecipeSearchResponse {
  id?: number;
  name?: string;
  url?: string;
  imageUrl?: string;
  ingredients?: Ingredient[];
  cookingTime?: number;
  sourcePage?: string;
}

export interface PageResponseRecipeSearchResponse {
  items?: RecipeSearchResponse[];
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
