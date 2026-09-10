import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
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
  imports: [DualRangeComponent, CollectionInputComponent, ClickOutsideDirective],
  templateUrl: './filter-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarComponent {
  state = inject(SearchStateService);
  languageService = inject(LanguageService);
  authService = inject(AuthService);

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
    const min = this.state.minTime();
    const max = this.state.maxTime();
    if (min === undefined && max === undefined) return 'elkészítési idő';
    if (max !== undefined && min === undefined) return `max. ${max} perc`;
    if (min !== undefined && max === undefined) return `min. ${min} perc`;
    return `${min}–${max} perc`;
  });

  ingredientsLabel = computed(() => {
    const min = this.state.minIngredients();
    const max = this.state.maxIngredients();
    if (min === undefined && max === undefined) return 'hozzávalók száma';
    if (max !== undefined && min === undefined) return `max. ${max} db`;
    if (min !== undefined && max === undefined) return `min. ${min} db`;
    return `${min}–${max} db`;
  });

  sitesLabel = computed(() => {
    const n = this.state.sites().size;
    return n > 0 ? `${n} oldal` : 'oldalak';
  });

  resultCountLabel = computed(() => this.state.totalCount().toLocaleString('hu-HU'));

  sortLabel = computed(() => {
    const sort = this.state.sort();
    if (!sort.orderBy) return 'rendezés: relevancia';
    const field = sort.orderBy === 'prepTime' ? 'idő' : 'hozzávalók';
    const dir = sort.orderDirection === 'desc' ? 'csökkenő' : 'növekvő';
    return `${field}, ${dir}`;
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
