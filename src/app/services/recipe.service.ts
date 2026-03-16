import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

export interface IngredientName {
  name?: string;
  languageIso?: string;
}

export interface Ingredient {
  id?: number;
  names?: IngredientName[];
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

export interface RecipeSearchRequest {
  includedIngredientGroups?: IngredientGroupWithRelation[];
  excludedIngredients?: number[];
  filterByName?: string;
  limit?: number;
  page?: number;
}

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

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  search(request: RecipeSearchRequest): Observable<PageResponseRecipeSearchResponse> {
    return this.http.post<PageResponseRecipeSearchResponse>(`${this.baseUrl}/recipes/search`, request);
  }
}
