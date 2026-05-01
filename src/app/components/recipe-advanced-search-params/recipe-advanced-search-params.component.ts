import {Component, computed, inject} from '@angular/core';
import {RecipeService} from '../../services/recipe.service';
import {RecipeOrderBy, RecipeOrderDirection} from '../../services/requests';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {DualRangeComponent} from '../dual-range/dual-range.component';
import {LanguageService} from '../../services/language.service';
import {SourcePageResponse} from '../../services/responses';

@Component({
  selector: 'app-recipe-advanced-search-params',
  imports: [FormsModule, TranslatePipe, DualRangeComponent],
  templateUrl: './recipe-advanced-search-params.component.html',
  styleUrl: './recipe-advanced-search-params.component.css'
})
export class RecipeAdvancedSearchParamsComponent {
  recipeService = inject(RecipeService);
  private languageService = inject(LanguageService);

  sourcePageGroups = computed(() => {
    const langMap = new Map(this.languageService.languages().map(l => [l.id, l]));
    const grouped = new Map<number, { languageId: number; languageName: string; pages: SourcePageResponse[] }>();
    for (const page of this.recipeService.sourcePages()) {
      if (!grouped.has(page.languageId)) {
        grouped.set(page.languageId, {
          languageId: page.languageId,
          languageName: langMap.get(page.languageId)?.isoName.toUpperCase() ?? '?',
          pages: []
        });
      }
      grouped.get(page.languageId)!.pages.push(page);
    }
    return [...grouped.values()];
  });

  private collapsedGroups = new Set<number>();

  isGroupExpanded(langId: number): boolean {
    return !this.collapsedGroups.has(langId);
  }

  toggleGroup(langId: number): void {
    if (this.collapsedGroups.has(langId)) {
      this.collapsedGroups.delete(langId);
    } else {
      this.collapsedGroups.add(langId);
    }
  }

  selectedCountInGroup(langId: number): number {
    return this.recipeService.sourcePages()
      .filter(p => p.languageId === langId && this.isSourcePageSelected(p.id))
      .length;
  }

  get orderBy(): RecipeOrderBy | '' {
    return this.recipeService.queryParams.orderBy ?? '';
  }

  get orderDirection(): RecipeOrderDirection {
    return this.recipeService.queryParams.orderDirection ?? 'asc';
  }

  get prepTimeMin(): number | undefined {
    return this.recipeService.queryParams.prepTime?.min;
  }

  get prepTimeMax(): number | undefined {
    return this.recipeService.queryParams.prepTime?.max;
  }

  get countIngredientsMin(): number | undefined {
    return this.recipeService.queryParams.countIngredients?.min;
  }

  get countIngredientsMax(): number | undefined {
    return this.recipeService.queryParams.countIngredients?.max;
  }

  orderByChange(value: string): void {
    this.recipeService.queryParams.orderBy = value ? value as RecipeOrderBy : undefined;
    this.recipeService.resetPage();
    this.recipeService.queryParamsChanged$.next();
  }

  setDirection(direction: RecipeOrderDirection): void {
    this.recipeService.queryParams.orderDirection = direction;
    this.recipeService.resetPage();
    this.recipeService.queryParamsChanged$.next();
  }

  setPrepTimeMin(value: number | null): void {
    this.recipeService.queryParams.prepTime = this.mergeRange(this.recipeService.queryParams.prepTime, 'min', value ?? undefined);
    this.recipeService.resetPage();
    this.recipeService.queryParamsChanged$.next();
  }

  setPrepTimeMax(value: number | null): void {
    this.recipeService.queryParams.prepTime = this.mergeRange(this.recipeService.queryParams.prepTime, 'max', value ?? undefined);
    this.recipeService.resetPage();
    this.recipeService.queryParamsChanged$.next();
  }

  setCountIngredientsMin(value: number | null): void {
    this.recipeService.queryParams.countIngredients = this.mergeRange(this.recipeService.queryParams.countIngredients, 'min', value ?? undefined);
    this.recipeService.resetPage();
    this.recipeService.queryParamsChanged$.next();
  }

  setCountIngredientsMax(value: number | null): void {
    this.recipeService.queryParams.countIngredients = this.mergeRange(this.recipeService.queryParams.countIngredients, 'max', value ?? undefined);
    this.recipeService.resetPage();
    this.recipeService.queryParamsChanged$.next();
  }

  isSourcePageSelected(id: number): boolean {
    return this.recipeService.queryParams.sourcePages?.includes(id) ?? false;
  }

  toggleSourcePage(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.recipeService.queryParams.sourcePages ?? [];
    const updated = checked ? [...current, id] : current.filter(x => x !== id);
    this.recipeService.queryParams.sourcePages = updated.length > 0 ? updated : undefined;
    this.recipeService.resetPage();
    this.recipeService.queryParamsChanged$.next();
  }

  private mergeRange(current: {min?: number; max?: number} | undefined, field: 'min' | 'max', value: number | undefined) {
    const updated = {...current, [field]: value};
    return updated.min == null && updated.max == null ? undefined : updated;
  }
}
