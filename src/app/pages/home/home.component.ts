import {Component, DestroyRef, OnInit, computed, effect, inject, signal} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router} from '@angular/router';
import {debounceTime} from 'rxjs/operators';
import {firstValueFrom} from 'rxjs';
import {SearchStateService} from '../../services/search-state.service';
import {LanguageService} from '../../services/language.service';
import {IngredientsService} from '../../services/ingredients.service';
import {RecipeOrderBy, RecipeOrderDirection} from '../../services/requests';
import {Chip, IncludeLane} from '../../models/chip.model';
import {IngredientComposerComponent} from '../../components/ingredient-composer/ingredient-composer.component';
import {FilterBarComponent} from '../../components/filter-bar/filter-bar.component';
import {RecipeGridComponent} from '../../components/recipe-grid/recipe-grid.component';
import {PaginationComponent} from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IngredientComposerComponent, FilterBarComponent, RecipeGridComponent, PaginationComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  state = inject(SearchStateService);
  private languageService = inject(LanguageService);
  private ingredientsService = inject(IngredientsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  private hydrated = signal(false);

  private requestTrigger = computed(() => ({
    q: this.state.nameQuery(),
    inc: this.state.includeLanes(),
    incRel: this.state.includeRelations(),
    exc: this.state.excludeChips(),
    minTime: this.state.minTime(),
    maxTime: this.state.maxTime(),
    minIng: this.state.minIngredients(),
    maxIng: this.state.maxIngredients(),
    sites: Array.from(this.state.sites()),
    sitesTouched: this.state.sitesTouched(),
    sort: this.state.sort(),
    page: this.state.page(),
    collections: this.state.selectedCollectionIds(),
    lang: this.languageService.selectedLanguage()?.id,
    hydrated: this.hydrated()
  }));

  constructor() {
    effect(() => {
      const lang = this.languageService.selectedLanguage();
      if (lang && !this.hydrated()) {
        this.hydrateFromUrl(lang.id).then(() => this.hydrated.set(true));
      }
    });

    toObservable(this.requestTrigger)
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(trigger => {
        if (!trigger.lang || !trigger.hydrated) return;
        this.performSearch();
        this.syncUrl();
      });
  }

  ngOnInit(): void {
    this.languageService.getAllIfNeeded();
  }

  onPageChange(page: number) {
    this.state.setPage(page);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  private performSearch() {
    this.state.loading.set(true);
    this.state.fetch().subscribe({
      next: res => {
        this.state.results.set(res.items ?? []);
        this.state.totalCount.set(res.totalCount ?? 0);
        this.state.loading.set(false);
      },
      error: () => this.state.loading.set(false)
    });
  }

  private syncUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.state.toQueryParams(),
      replaceUrl: true
    });
  }

  private async hydrateFromUrl(languageId: number): Promise<void> {
    const params = this.route.snapshot.queryParamMap;

    const q = params.get('q');
    if (q) this.state.nameQuery.set(q);

    const page = params.get('page');
    if (page) this.state.page.set(Number(page));

    const minTime = params.get('minTime');
    if (minTime) this.state.minTime.set(Number(minTime));

    const time = params.get('time');
    if (time) this.state.maxTime.set(Number(time));

    const minIng = params.get('minIng');
    if (minIng) this.state.minIngredients.set(Number(minIng));

    const ing = params.get('ing');
    if (ing) this.state.maxIngredients.set(Number(ing));

    const sites = params.get('sites');
    if (sites) {
      this.state.sites.set(new Set(sites.split(',').map(Number)));
      this.state.sitesTouched.set(true);
    }

    const sort = params.get('sort');
    if (sort) {
      const [orderBy, orderDirection] = sort.split(':');
      this.state.sort.set({
        orderBy: orderBy as RecipeOrderBy,
        orderDirection: orderDirection as RecipeOrderDirection
      });
    }

    const incKeys = params.get('inc')?.split(',').filter(Boolean) ?? [];
    const excKeys = params.get('exc')?.split(',').filter(Boolean) ?? [];

    const [includeChips, excludeChips] = await Promise.all([
      this.resolveChips(languageId, incKeys),
      this.resolveChips(languageId, excKeys)
    ]);
    this.state.excludeChips.set(excludeChips);

    const laneSizes = params.get('incGrp')?.split(',').map(Number).filter(n => n > 0)
      ?? (includeChips.length > 0 ? [includeChips.length] : []);
    const lanes: IncludeLane[] = [];
    let offset = 0;
    for (const size of laneSizes) {
      lanes.push({chips: includeChips.slice(offset, offset + size)});
      offset += size;
    }
    lanes.push({chips: []});
    this.state.includeLanes.set(lanes);

    const relCount = Math.max(0, lanes.length - 1);
    const relParam = params.get('incRel')?.split(',') ?? [];
    this.state.includeRelations.set(
      Array.from({length: relCount}, (_, i) => relParam[i] === 'O' ? 'OR' : 'AND')
    );
  }

  private async resolveChips(languageId: number, keys: string[]): Promise<Chip[]> {
    if (keys.length === 0) return [];

    const ingredientIds = keys.filter(k => k.startsWith('i:')).map(k => Number(k.slice(2)));
    const categoryIds = keys.filter(k => k.startsWith('c:')).map(k => Number(k.slice(2)));
    const chips: Chip[] = [];

    if (ingredientIds.length > 0) {
      const list = await firstValueFrom(this.ingredientsService.findByIds(languageId, ingredientIds));
      list.forEach(i => chips.push({key: `i:${i.ingredientId}`, label: i.name, ids: [i.ingredientId], isCategory: false}));
    }

    if (categoryIds.length > 0) {
      const categories = await firstValueFrom(this.ingredientsService.findCategoriesByIds(languageId, categoryIds));
      for (const category of categories) {
        const names = await firstValueFrom(this.ingredientsService.findByIds(languageId, category.ingredientIds));
        chips.push({
          key: `c:${category.id}`,
          label: names.map(n => n.name).join(' / ') || category.name,
          ids: category.ingredientIds,
          isCategory: true,
          categoryId: category.id
        });
      }
    }

    return keys.map(k => chips.find(c => c.key === k)).filter((c): c is Chip => !!c);
  }
}
