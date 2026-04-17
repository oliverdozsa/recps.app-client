import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IngredientCategorySearchResponse, IngredientSearchResponse} from './responses';
import {IngredientCategorySearchRequest, IngredientSearchRequest, IngredientsByIdsRequest} from './requests';
import {environment} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class IngredientsService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  search(languageId: number, query: string): Observable<IngredientSearchResponse[]> {
    const request: IngredientSearchRequest = {languageId, query};
    return this.http.post<IngredientSearchResponse[]>(`${this.baseUrl}/ingredients/search`, request);
  }

  findByIds(languageId: number, ids: number[]): Observable<IngredientSearchResponse[]> {
    const request: IngredientsByIdsRequest = {languageId, ids};
    return this.http.post<IngredientSearchResponse[]>(`${this.baseUrl}/ingredients/byIds`, request);
  }

  searchCategories(languageId: number, filterByName: string): Observable<IngredientCategorySearchResponse[]> {
    const request: IngredientCategorySearchRequest = {languageId, filterByName};
    return this.http.post<IngredientCategorySearchResponse[]>(`${this.baseUrl}/ingredient-categories/search`, request);
  }
}
