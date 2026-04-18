import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {IngredientCategorySearchResponse, IngredientSearchResponse, IngredientSearchAndCategoryUnion} from './responses';
import {IngredientCategoryByIdsRequest, IngredientCategorySearchRequest, IngredientSearchRequest, IngredientsByIdsRequest} from './requests';
import {environment} from '../../environments/environment';

export enum SearchSource {
  Ingredients,
  Categories
}

@Injectable({
  providedIn: 'root'
})
export class IngredientsService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  searchUnified(languageId: number, query: string, source: SearchSource): Observable<IngredientSearchAndCategoryUnion[]> {
    if (source === SearchSource.Categories) {
      return this.searchCategories(languageId, query)
        .pipe(map(cs => cs.map(category => ({category}))));
    }
    return this.searchIngredients(languageId, query)
      .pipe(map(is => is.map(ingredient => ({ingredient}))));
  }

  findByIds(languageId: number, ids: number[]): Observable<IngredientSearchResponse[]> {
    const request: IngredientsByIdsRequest = {languageId, ids};
    return this.http.post<IngredientSearchResponse[]>(`${this.baseUrl}/ingredients/byIds`, request);
  }

  findCategoriesByIds(languageId: number, ids: number[]): Observable<IngredientCategorySearchResponse[]> {
    const request: IngredientCategoryByIdsRequest = {languageId, ids};
    return this.http.post<IngredientCategorySearchResponse[]>(`${this.baseUrl}/ingredient-categories/byIds`, request);
  }

  private searchIngredients(languageId: number, query: string): Observable<IngredientSearchResponse[]> {
    const request: IngredientSearchRequest = {languageId, query};
    return this.http.post<IngredientSearchResponse[]>(`${this.baseUrl}/ingredients/search`, request);
  }

  private searchCategories(languageId: number, filterByName: string): Observable<IngredientCategorySearchResponse[]> {
    const request: IngredientCategorySearchRequest = {languageId, filterByName};
    return this.http.post<IngredientCategorySearchResponse[]>(`${this.baseUrl}/ingredient-categories/search`, request);
  }
}
