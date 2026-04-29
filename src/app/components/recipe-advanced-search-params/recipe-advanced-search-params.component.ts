import {Component, inject} from '@angular/core';
import {RecipeService} from '../../services/recipe.service';
import {RecipeOrderBy, RecipeOrderDirection} from '../../services/requests';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {DualRangeComponent} from '../dual-range/dual-range.component';

@Component({
  selector: 'app-recipe-advanced-search-params',
  imports: [FormsModule, TranslatePipe, DualRangeComponent],
  templateUrl: './recipe-advanced-search-params.component.html',
  styleUrl: './recipe-advanced-search-params.component.css'
})
export class RecipeAdvancedSearchParamsComponent {
  private recipeService = inject(RecipeService);

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

  private mergeRange(current: {min?: number; max?: number} | undefined, field: 'min' | 'max', value: number | undefined) {
    const updated = {...current, [field]: value};
    return updated.min == null && updated.max == null ? undefined : updated;
  }
}
