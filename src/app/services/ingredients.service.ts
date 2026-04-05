import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IngredientSearchResponse} from './responses';
import {IngredientSearchRequest} from './requests';
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
}
