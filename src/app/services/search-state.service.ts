import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Params} from '@angular/router';
import {switchMap} from 'rxjs';
import {LanguageService} from './language.service';
import {RecipeOrderBy, RecipeOrderDirection, RecipeSearchRequest} from './requests';
import {PageResponseRecipeSearchResponse, SourcePageResponse} from './responses';
import {Chip} from '../models/chip.model';
import {environment} from '../../environments/environment';

export interface SortOption {
  orderBy?: RecipeOrderBy;
  orderDirection?: RecipeOrderDirection;
}

const PAGE_SIZE = 15;

@Injectable({
  providedIn: 'root'
})
export class SearchStateService {
  private http = inject(HttpClient);
  private languageService = inject(LanguageService);
  private baseUrl = environment.apiUrl;

  nameQuery = signal<string>('');
  includeChips = signal<Chip[]>([]);
  excludeChips = signal<Chip[]>([]);
  minTime = signal<number | undefined>(undefined);
  maxTime = signal<number | undefined>(undefined);
  minIngredients = signal<number | undefined>(undefined);
  maxIngredients = signal<number | undefined>(undefined);
  sites = signal<Set<number>>(new Set<number>());
  sitesTouched = signal<boolean>(false);
  sort = signal<SortOption>({});
  page = signal<number>(0);
  selectedCollectionIds = signal<number[]>([]);

  sourcePages = signal<SourcePageResponse[]>([]);

  results = signal<PageResponseRecipeSearchResponse['items']>([]);
  totalCount = signal<number>(0);
  loading = signal<boolean>(false);

  matchedIngredientIds = computed<Set<number>>(() => {
    const ids = new Set<number>();
    this.includeChips().forEach(chip => chip.ids.forEach(id => ids.add(id)));
    return ids;
  });

  conflictingIngredientIds = computed<Set<number>>(() => {
    const includeIds = this.matchedIngredientIds();
    const excludeIds = new Set<number>();
    this.excludeChips().forEach(chip => chip.ids.forEach(id => excludeIds.add(id)));
    const conflicts = new Set<number>();
    includeIds.forEach(id => {
      if (excludeIds.has(id)) conflicts.add(id);
    });
    return conflicts;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / PAGE_SIZE)));

  isFilterDirty = computed(() => {
    return !!this.nameQuery()
      || this.includeChips().length > 0
      || this.excludeChips().length > 0
      || this.minTime() !== undefined
      || this.maxTime() !== undefined
      || this.minIngredients() !== undefined
      || this.maxIngredients() !== undefined
      || this.sitesTouched();
  });

  getSourcePages() {
    return this.http.get<SourcePageResponse[]>(`${this.baseUrl}/recipes/sourcePages`);
  }

  addIncludeChip(chip: Chip) {
    if (this.includeChips().some(c => c.key === chip.key)) return;
    this.includeChips.update(chips => [...chips, chip]);
    this.page.set(0);
  }

  removeIncludeChip(chip: Chip) {
    this.includeChips.update(chips => chips.filter(c => c.key !== chip.key));
    this.page.set(0);
  }

  addExcludeChip(chip: Chip) {
    if (this.excludeChips().some(c => c.key === chip.key)) return;
    this.excludeChips.update(chips => [...chips, chip]);
    this.page.set(0);
  }

  removeExcludeChip(chip: Chip) {
    this.excludeChips.update(chips => chips.filter(c => c.key !== chip.key));
    this.page.set(0);
  }

  setNameQuery(value: string) {
    this.nameQuery.set(value);
    this.page.set(0);
  }

  setMinTime(value: number | undefined) {
    this.minTime.set(value);
    this.page.set(0);
  }

  setMaxTime(value: number | undefined) {
    this.maxTime.set(value);
    this.page.set(0);
  }

  setMinIngredients(value: number | undefined) {
    this.minIngredients.set(value);
    this.page.set(0);
  }

  setMaxIngredients(value: number | undefined) {
    this.maxIngredients.set(value);
    this.page.set(0);
  }

  toggleSite(id: number) {
    this.sitesTouched.set(true);
    this.sites.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    this.page.set(0);
  }

  setSort(sort: SortOption) {
    this.sort.set(sort);
    this.page.set(0);
  }

  setPage(page: number) {
    this.page.set(page);
  }

  resetFilters() {
    this.nameQuery.set('');
    this.includeChips.set([]);
    this.excludeChips.set([]);
    this.minTime.set(undefined);
    this.maxTime.set(undefined);
    this.minIngredients.set(undefined);
    this.maxIngredients.set(undefined);
    this.sites.set(new Set());
    this.sitesTouched.set(false);
    this.sort.set({});
    this.page.set(0);
  }

  clearCollections() {
    this.selectedCollectionIds.set([]);
  }

  buildRequest(): RecipeSearchRequest {
    const languageId = this.languageService.selectedLanguage()?.id ?? 0;
    const activeSites = this.sitesTouched()
      ? Array.from(this.sites())
      : this.sourcePages().filter(s => s.languageId === languageId).map(s => s.id);

    return {
      ingredientLanguageId: languageId,
      limit: PAGE_SIZE,
      page: this.page(),
      filterByName: this.nameQuery() || undefined,
      includedIngredientGroups: this.includeChips().length > 0
        ? this.includeChips().map(chip => ({
          group: {
            ids: chip.ids,
            minMatch: chip.isCategory ? (chip.minMatch ?? 1) : chip.ids.length,
            asPercent: chip.isCategory ? (chip.asPercent ?? false) : false
          }
        }))
        : undefined,
      excludedIngredients: this.excludeChips().length > 0
        ? this.excludeChips().flatMap(c => c.ids)
        : undefined,
      prepTime: (this.minTime() !== undefined || this.maxTime() !== undefined)
        ? {min: this.minTime(), max: this.maxTime()} : undefined,
      countIngredients: (this.minIngredients() !== undefined || this.maxIngredients() !== undefined)
        ? {min: this.minIngredients(), max: this.maxIngredients()} : undefined,
      sourcePages: activeSites.length > 0 ? activeSites : undefined,
      orderBy: this.sort().orderBy,
      orderDirection: this.sort().orderDirection,
      collections: this.selectedCollectionIds().length > 0 ? this.selectedCollectionIds() : undefined
    };
  }

  fetch() {
    return this.http.post<PageResponseRecipeSearchResponse>(`${this.baseUrl}/recipes/search`, this.buildRequest());
  }

  searchRandomPage(partial: Partial<RecipeSearchRequest>) {
    const request: RecipeSearchRequest = {
      ingredientLanguageId: this.languageService.selectedLanguage()?.id ?? 0,
      limit: 15,
      ...partial
    };
    return this.http.post<PageResponseRecipeSearchResponse>(`${this.baseUrl}/recipes/search`, request).pipe(
      switchMap(page => {
        const totalPages = Math.max(1, Math.ceil((page.totalCount ?? 0) / request.limit));
        request.page = Math.floor(Math.random() * totalPages);
        return this.http.post<PageResponseRecipeSearchResponse>(`${this.baseUrl}/recipes/search`, request);
      })
    );
  }

  toQueryParams(): Params {
    const params: Params = {};
    if (this.nameQuery()) params['q'] = this.nameQuery();
    if (this.includeChips().length > 0) params['inc'] = this.includeChips().map(c => c.key).join(',');
    if (this.excludeChips().length > 0) params['exc'] = this.excludeChips().map(c => c.key).join(',');
    if (this.minTime() !== undefined) params['minTime'] = this.minTime();
    if (this.maxTime() !== undefined) params['time'] = this.maxTime();
    if (this.minIngredients() !== undefined) params['minIng'] = this.minIngredients();
    if (this.maxIngredients() !== undefined) params['ing'] = this.maxIngredients();
    if (this.sitesTouched() && this.sites().size > 0) params['sites'] = Array.from(this.sites()).join(',');
    if (this.sort().orderBy) params['sort'] = `${this.sort().orderBy}:${this.sort().orderDirection ?? 'asc'}`;
    if (this.page() > 0) params['page'] = this.page();
    return params;
  }
}
