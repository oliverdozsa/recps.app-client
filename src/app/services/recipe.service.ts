import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject, tap} from 'rxjs';
import {IngredientSearchAndCategoryUnion, PageResponseRecipeSearchResponse, SourcePageResponse} from './responses';
import {RecipeSearchRequest} from './requests';
import {environment} from '../../environments/environment';
import {IngredientGroupRelation} from './common.data';
import {LanguageService} from './language.service';

interface PersistedRecipeQuery {
  timestamp: number;
  queryParams: RecipeSearchRequest;
  includedIngredientGroups: IngredientSearchAndCategoryUnion[][];
  laneRelations: IngredientGroupRelation[];
  excludedIngredients: IngredientSearchAndCategoryUnion[];
  categoryMinMatch: Record<number, number>;
  categoryAsPercent: Record<number, boolean>;
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

  includedIngredientGroups: IngredientSearchAndCategoryUnion[][] = [[]];
  laneRelations: IngredientGroupRelation[] = [];
  excludedIngredients: IngredientSearchAndCategoryUnion[] = [];
  categoryMinMatch: Record<number, number> = {};
  categoryAsPercent: Record<number, boolean> = {};

  conflictingIngredients = new Set<number>();
  sourcePages = signal<SourcePageResponse[]>([]);

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private languageService = inject(LanguageService);

  constructor() {
    this.loadPersistedQuery();
    this.queryParamsChanged$.subscribe(() => this.persistQuery());
  }

  search(): Observable<PageResponseRecipeSearchResponse> {
    this.setDefaultSourcePagesIfNeeded();
    return this.http.post<PageResponseRecipeSearchResponse>(`${this.baseUrl}/recipes/search`, this.queryParams);
  }

  getSourcePages(): Observable<SourcePageResponse[]> {
    return this.http.get<SourcePageResponse[]>(`${this.baseUrl}/recipes/sourcePages`).pipe(
      tap(pages => this.sourcePages.set(pages))
    );
  }

  determineConflictingIngredients() {
    const includedIngredientIds = new Set<number>(this.collectIncludedIngredientIds());
    const excludedIngredientIds = new Set<number>(this.collectExcludedIngredientIds());

    this.conflictingIngredients.clear();
    includedIngredientIds.forEach(id => {
      if(excludedIngredientIds.has(id) && !this.doesIngredientIdBelongToCategory(id)) {
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
      const rawIncluded = parsed.includedIngredientGroups;
      if (Array.isArray(rawIncluded) && rawIncluded.length > 0 && Array.isArray(rawIncluded[0])) {
        this.includedIngredientGroups = rawIncluded;
      } else {
        this.includedIngredientGroups = [[]];
      }
      this.laneRelations = parsed.laneRelations ?? [];
      this.excludedIngredients = parsed.excludedIngredients ?? [];
      this.categoryMinMatch = parsed.categoryMinMatch ?? {};
      this.categoryAsPercent = parsed.categoryAsPercent ?? {};
      this.determineConflictingIngredients();
    } catch {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }
  }

  private persistQuery() {
    const payload: PersistedRecipeQuery = {
      timestamp: Date.now(),
      queryParams: this.queryParams,
      includedIngredientGroups: this.includedIngredientGroups,
      laneRelations: this.laneRelations,
      excludedIngredients: this.excludedIngredients,
      categoryMinMatch: this.categoryMinMatch,
      categoryAsPercent: this.categoryAsPercent,
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

  private doesIngredientIdBelongToCategory(id: number) {

    const items = this.includedIngredientGroups.flat().concat(this.excludedIngredients);
    for(let item of items) {
      if(item.ingredient) {
        continue
      }

      if(item.category!.ingredientIds.includes(id)) {
        return true;
      }
    }

    return false;
  }

  private setDefaultSourcePagesIfNeeded() {
    if(localStorage.getItem(STORAGE_KEY) == null) {
      const languageId = this.languageService.selectedLanguage()!.id;
      this.queryParams.sourcePages = this.sourcePages()
        .filter(s => s.languageId == languageId)
        .map(s => s.id);
    }
  }
}
