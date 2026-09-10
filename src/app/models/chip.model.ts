import {IngredientSearchAndCategoryUnion, isCategory, unionIds, unionKey, unionName} from '../services/responses';

export interface Chip {
  key: string;
  label: string;
  ids: number[];
  isCategory: boolean;
  categoryId?: number;
  minMatch?: number;
  asPercent?: boolean;
}

export function chipFromUnion(u: IngredientSearchAndCategoryUnion): Chip {
  return {
    key: unionKey(u),
    label: unionName(u),
    ids: unionIds(u),
    isCategory: isCategory(u),
    categoryId: u.category?.id
  };
}
