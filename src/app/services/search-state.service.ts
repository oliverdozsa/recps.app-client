import {computed, effect, inject, Injectable, signal, untracked} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Params} from '@angular/router';
import {switchMap} from 'rxjs';
import {LanguageService} from './language.service';
import {IngredientsService} from './ingredients.service';
import {RecipeOrderBy, RecipeOrderDirection, RecipeSearchRequest} from './requests';
import {PageResponseRecipeSearchResponse, SourcePageResponse} from './responses';
import {IngredientGroupRelation, IngredientGroupWithRelation} from './common.data';
import {Chip, IncludeLane} from '../models/chip.model';
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
  private ingredientsService = inject(IngredientsService);
  private baseUrl = environment.apiUrl;

  nameQuery = signal<string>('');

  /**
   * Include ingredients/categories, grouped into lanes. All chips within one lane are AND'd
   * together; each lane has its own add control, so a chip can be added to any lane directly.
   * Consecutive lanes are combined via includeRelations[i], which joins lane i with lane i+1
   * (so its length is always includeLanes.length - 1). There is always at least one (possibly
   * empty) trailing lane, which is what "+ csoport" appends to.
   */
  includeLanes = signal<IncludeLane[]>([{chips: []}]);
  includeRelations = signal<IngredientGroupRelation[]>([]);

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

  includeChips = computed<Chip[]>(() => this.includeLanes().flatMap(lane => lane.chips));

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

  constructor() {
    // Re-labels already-added chips in the newly selected language, so switching languages
    // doesn't leave previously picked ingredients/categories displayed in the old one.
    effect(() => {
      const languageId = this.languageService.selectedLanguage()?.id;
      if (languageId !== undefined) {
        untracked(() => this.retranslateChips(languageId));
      }
    });
  }

  private retranslateChips(languageId: number) {
    const allChips = [...this.includeLanes().flatMap(lane => lane.chips), ...this.excludeChips()];
    const allIds = Array.from(new Set(allChips.flatMap(c => c.ids)));
    if (allIds.length === 0) return;

    this.ingredientsService.findByIds(languageId, allIds).subscribe(results => {
      const nameById = new Map(results.map(r => [r.ingredientId, r.name]));
      const relabel = (chip: Chip): Chip => {
        const names = chip.ids.map(id => nameById.get(id)).filter((n): n is string => !!n);
        return names.length > 0 ? {...chip, label: names.join(' / ')} : chip;
      };
      this.includeLanes.update(lanes => lanes.map(lane => ({chips: lane.chips.map(relabel)})));
      this.excludeChips.update(chips => chips.map(relabel));
    });
  }

  getSourcePages() {
    return this.http.get<SourcePageResponse[]>(`${this.baseUrl}/recipes/sourcePages`);
  }

  addIncludeChip(chip: Chip, laneIndex: number) {
    if (this.includeChips().some(c => c.key === chip.key)) return;
    this.includeLanes.update(lanes => {
      const next = lanes.map(lane => ({chips: lane.chips}));
      next[laneIndex] = {chips: [...next[laneIndex].chips, chip]};
      return next;
    });
    this.page.set(0);
  }

  removeIncludeChip(chip: Chip) {
    const laneIndex = this.includeLanes().findIndex(lane => lane.chips.some(c => c.key === chip.key));
    if (laneIndex === -1) return;

    let lanes = this.includeLanes().map(lane => ({
      chips: lane.chips.filter(c => c.key !== chip.key)
    }));
    let relations = [...this.includeRelations()];

    // Prune a lane that became empty, unless it's the sole (trailing, in-progress) lane.
    if (lanes[laneIndex].chips.length === 0 && lanes.length > 1) {
      lanes = lanes.filter((_, i) => i !== laneIndex);
      const relationIndex = Math.min(laneIndex, relations.length - 1);
      relations = relations.filter((_, i) => i !== relationIndex);
    }

    this.includeLanes.set(lanes);
    this.includeRelations.set(relations);
    this.page.set(0);
  }

  /** Starts a new, currently-empty lane that subsequent chips will be added to. */
  addIncludeLane() {
    const lanes = this.includeLanes();
    if (lanes.length > 0 && lanes[lanes.length - 1].chips.length === 0) return;
    this.includeLanes.update(current => [...current, {chips: []}]);
    this.includeRelations.update(relations => [...relations, 'AND']);
  }

  toggleIncludeRelation(index: number) {
    this.includeRelations.update(relations => relations.map((r, i) => i === index ? (r === 'AND' ? 'OR' : 'AND') : r));
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
    this.includeLanes.set([{chips: []}]);
    this.includeRelations.set([]);
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

  /** Non-empty lanes, i.e. excluding the trailing in-progress lane when it has no chips yet. */
  private populatedLanes(): IncludeLane[] {
    return this.includeLanes().filter(lane => lane.chips.length > 0);
  }

  private buildIncludedIngredientGroups(): IngredientGroupWithRelation[] | undefined {
    const lanes = this.populatedLanes();
    if (lanes.length === 0) return undefined;

    const relations = this.includeRelations();
    const result: IngredientGroupWithRelation[] = [];

    lanes.forEach((lane, laneIndex) => {
      const laneRelation = lanes.length > 1 && laneIndex < lanes.length - 1
        ? (relations[laneIndex] ?? 'AND')
        : undefined;

      const categories = lane.chips.filter(c => c.isCategory);
      const ingredients = lane.chips.filter(c => !c.isCategory);
      const laneGroups: IngredientGroupWithRelation[] = categories.map(c => ({
        group: {ids: c.ids, minMatch: c.minMatch ?? 1, asPercent: c.asPercent ?? false}
      }));

      if (ingredients.length > 0) {
        const ids = ingredients.flatMap(i => i.ids);
        laneGroups.push({group: {ids, minMatch: ids.length}});
      }

      if (laneGroups.length > 0 && laneRelation) {
        laneGroups[laneGroups.length - 1] = {...laneGroups[laneGroups.length - 1], relation: laneRelation};
      }

      result.push(...laneGroups);
    });

    return result.length > 0 ? result : undefined;
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
      includedIngredientGroups: this.buildIncludedIngredientGroups(),
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
    const lanes = this.populatedLanes();

    if (this.nameQuery()) params['q'] = this.nameQuery();
    if (lanes.length > 0) {
      params['inc'] = lanes.flatMap(lane => lane.chips.map(c => c.key)).join(',');
      if (lanes.length > 1) {
        params['incGrp'] = lanes.map(lane => lane.chips.length).join(',');
      }
      const realRelations = this.includeRelations().slice(0, lanes.length - 1);
      if (lanes.length > 1 && realRelations.some(r => r === 'OR')) {
        params['incRel'] = realRelations.map(r => r === 'OR' ? 'O' : 'A').join(',');
      }
    }
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
