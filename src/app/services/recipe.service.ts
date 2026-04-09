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

  conflictingIngredients = new Set<number>();

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  search(): Observable<PageResponseRecipeSearchResponse> {
    return this.http.post<PageResponseRecipeSearchResponse>(`${this.baseUrl}/recipes/search`, this.queryParams);
  }

  determineConflictingIngredients() {
    const includedIngredientIds = new Set<number>(this.collectIncludedIngredientIds());
    const excludedIngredientIds = new Set<number>(this.collectExcludedIngredientIds());

    this.conflictingIngredients.clear();
    includedIngredientIds.forEach(id => {
      if(excludedIngredientIds.has(id)) {
        this.conflictingIngredients.add(id);
      }
    });
  }

  private collectIncludedIngredientIds(): number[] {
    if(!this.queryParams.includedIngredientGroups) {
      return [];
    }

    const result: number[] = [];

    this.queryParams.includedIngredientGroups.forEach(groupWithRelation => {
      const group = groupWithRelation.group;
      if(group?.ids) {
        result.push(...group.ids);
      }
    });

    return result;
  }

  private collectExcludedIngredientIds(): number[] {
    if(this.queryParams.excludedIngredients) {
      return this.queryParams.excludedIngredients;
    }

    return [];
  }
}
