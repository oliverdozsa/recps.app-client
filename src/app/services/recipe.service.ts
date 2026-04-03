import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {PageResponseRecipeSearchResponse} from './responses';
import {RecipeSearchRequest} from './requests';


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
