import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {PageResponseRecipeSearchResponse} from './responses';
import {RecipeSearchRequest} from './requests';
import {environment} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  queryParamsChanged$ = new Subject<void>();
  queryParams: RecipeSearchRequest = {
    limit: 15,
    page: 0
  };

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  search(): Observable<PageResponseRecipeSearchResponse> {
    return this.http.post<PageResponseRecipeSearchResponse>(`${this.baseUrl}/recipes/search`, this.queryParams);
  }
}
