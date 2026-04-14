export interface IngredientName {
  name?: string;
  languageIso?: string;
}

export interface Ingredient {
  id: number;
  names: IngredientName[];
}

export type IngredientGroupRelation = 'AND' | 'OR';

export interface IngredientGroup {
  ids: number[];
  minMatch?: number;
}

export interface IngredientGroupWithRelation {
  group?: IngredientGroup;
  relation?: IngredientGroupRelation;
}
