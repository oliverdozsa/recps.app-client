import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {DualRangeComponent} from '../dual-range/dual-range.component';
import {CollectionInputComponent} from '../collection-input/collection-input.component';
import {ClickOutsideDirective} from '../../directives/click-outside.directive';
import {SearchStateService, SortOption} from '../../services/search-state.service';
import {LanguageService} from '../../services/language.service';
import {AuthService} from '../../services/auth.service';
import {RecipeOrderBy, RecipeOrderDirection} from '../../services/requests';
import {RecipeCollectionSimplifiedResponse, SourcePageResponse} from '../../services/responses';

type PanelKey = 'time' | 'ingredients' | 'sites' | 'sort' | 'collections';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [DualRangeComponent, CollectionInputComponent, ClickOutsideDirective, TranslatePipe],
  templateUrl: './filter-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarComponent {
  state = inject(SearchStateService);
  languageService = inject(LanguageService);
  authService = inject(AuthService);
  private translate = inject(TranslateService);

  // Re-evaluates the computed labels below whenever the active language actually finishes
  // loading (translate.instant is not itself reactive to language switches).
  private langChange = toSignal(this.translate.onLangChange, {initialValue: null});

  openPanel = signal<PanelKey | null>(null);

  togglePanel(panel: PanelKey) {
    this.openPanel.update(current => current === panel ? null : panel);
  }

  closePanel() {
    this.openPanel.set(null);
  }

  sourcePagesByLanguage = computed(() => {
    const groups = new Map<number, SourcePageResponse[]>();
    this.state.sourcePages().forEach(sp => {
      const arr = groups.get(sp.languageId) ?? [];
      arr.push(sp);
      groups.set(sp.languageId, arr);
    });
    return Array.from(groups.entries()).map(([languageId, pages]) => ({
      languageId,
      isoName: this.languageService.languages().find(l => l.id === languageId)?.isoName ?? '',
      pages
    }));
  });

  timeLabel = computed(() => {
    this.langChange();
    const min = this.state.minTime();
    const max = this.state.maxTime();
    if (min === undefined && max === undefined) return this.translate.instant('recipeAdvancedSearchParams.prepTime');
    if (max !== undefined && min === undefined) return this.translate.instant('recipeAdvancedSearchParams.maxMinutes', {max});
    if (min !== undefined && max === undefined) return this.translate.instant('recipeAdvancedSearchParams.minMinutes', {min});
    return this.translate.instant('recipeAdvancedSearchParams.rangeMinutes', {min, max});
  });

  ingredientsLabel = computed(() => {
    this.langChange();
    const min = this.state.minIngredients();
    const max = this.state.maxIngredients();
    if (min === undefined && max === undefined) return this.translate.instant('recipeAdvancedSearchParams.countIngredients');
    if (max !== undefined && min === undefined) return this.translate.instant('recipeAdvancedSearchParams.maxCount', {max});
    if (min !== undefined && max === undefined) return this.translate.instant('recipeAdvancedSearchParams.minCount', {min});
    return this.translate.instant('recipeAdvancedSearchParams.rangeCount', {min, max});
  });

  sitesLabel = computed(() => {
    this.langChange();
    const n = this.state.sites().size;
    return n > 0 ? this.translate.instant('recipeAdvancedSearchParams.sourcePagesCount', {n}) : this.translate.instant('recipeAdvancedSearchParams.sourcePages');
  });

  resultCountLabel = computed(() => {
    this.langChange();
    const locale = this.translate.currentLang === 'en' ? 'en-US' : 'hu-HU';
    return this.state.totalCount().toLocaleString(locale);
  });

  sortLabel = computed(() => {
    this.langChange();
    const sort = this.state.sort();
    if (!sort.orderBy) return this.translate.instant('recipeAdvancedSearchParams.sortByRelevance');
    const fieldKey = sort.orderBy === 'prepTime' ? 'recipeAdvancedSearchParams.orderByPrepTime' : 'recipeAdvancedSearchParams.orderByIngredientCount';
    const dirKey = sort.orderDirection === 'desc' ? 'recipeAdvancedSearchParams.orderDesc' : 'recipeAdvancedSearchParams.orderAsc';
    return `${this.translate.instant(fieldKey)}, ${this.translate.instant(dirKey)}`;
  });

  onMinTime(v: number | null) {
    this.state.setMinTime(v ?? undefined);
  }

  onMaxTime(v: number | null) {
    this.state.setMaxTime(v ?? undefined);
  }

  onMinIngredients(v: number | null) {
    this.state.setMinIngredients(v ?? undefined);
  }

  onMaxIngredients(v: number | null) {
    this.state.setMaxIngredients(v ?? undefined);
  }

  toggleSite(id: number) {
    this.state.toggleSite(id);
  }

  isSiteChecked(id: number): boolean {
    return this.state.sites().has(id);
  }

  setSort(orderBy: RecipeOrderBy | undefined, orderDirection: RecipeOrderDirection) {
    const sort: SortOption = orderBy ? {orderBy, orderDirection} : {};
    this.state.setSort(sort);
  }

  onCollectionsChange(collections: RecipeCollectionSimplifiedResponse[]) {
    this.state.selectedCollectionIds.set(collections.map(c => c.id));
  }

  reset() {
    this.state.resetFilters();
  }
}
