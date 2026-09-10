import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RecipeCollectionDetailedResponse, RecipeCollectionSimplifiedResponse} from './responses';
import {CreateRecipeCollectionRequest, UpdateRecipeCollectionRequest} from './requests';
import {environment} from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class RecipeCollectionService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getAll(): Observable<RecipeCollectionSimplifiedResponse[]> {
    return this.http.get<RecipeCollectionSimplifiedResponse[]>(`${this.baseUrl}/recipes/collections`);
  }

  getById(id: number, languageId?: number): Observable<RecipeCollectionDetailedResponse> {
    const params: Record<string, string> = {};
    if (languageId !== undefined) {
      params['languageId'] = String(languageId);
    }
    return this.http.get<RecipeCollectionDetailedResponse>(`${this.baseUrl}/recipes/collections/${id}`, {params});
  }

  create(request: CreateRecipeCollectionRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/recipes/collections/create`, request);
  }

  update(id: number, request: UpdateRecipeCollectionRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/recipes/collections/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/recipes/collections/${id}`);
  }
}
