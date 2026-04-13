import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {IngredientSearchResponse, PageResponseRecipeSearchResponse} from './responses';
import {RecipeSearchRequest} from './requests';
import {environment} from '../../environments/environment';

interface PersistedRecipeQuery {
  timestamp: number;
  queryParams: RecipeSearchRequest;
  includedIngredients: IngredientSearchResponse[];
  excludedIngredients: IngredientSearchResponse[];
}

const STORAGE_KEY = 'recps.queryState';
const VALIDITY_MS = 60 * 60 * 1000; // 1 hour

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  queryParamsChanged$ = new Subject<void>();
  pageReset$ = new Subject<void>();
  queryParams: RecipeSearchRequest = {
    ingredientLanguageId: 0,
    limit: 15,
    page: 0
  };

  includedIngredients: IngredientSearchResponse[] = [];
  excludedIngredients: IngredientSearchResponse[] = [];

  conflictingIngredients = new Set<number>();

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  constructor() {
    this.loadPersistedQuery();
    this.queryParamsChanged$.subscribe(() => this.persistQuery());
  }

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

  resetPage() {
    this.queryParams.page = 0;
    this.pageReset$.next();
  }

  private loadPersistedQuery() {
    let raw: string | null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch {
      return;
    }
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as PersistedRecipeQuery;
      if (!parsed || typeof parsed.timestamp !== 'number' || !parsed.queryParams) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      if (Date.now() - parsed.timestamp > VALIDITY_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      this.queryParams = parsed.queryParams;
      this.includedIngredients = parsed.includedIngredients ?? [];
      this.excludedIngredients = parsed.excludedIngredients ?? [];
      this.determineConflictingIngredients();
    } catch {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }
  }

  private persistQuery() {
    const payload: PersistedRecipeQuery = {
      timestamp: Date.now(),
      queryParams: this.queryParams,
      includedIngredients: this.includedIngredients,
      excludedIngredients: this.excludedIngredients,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore (quota exceeded, privacy mode, etc.)
    }
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
