import {Component, inject} from '@angular/core';
import {RecipeService} from '../../services/recipe.service';
import {RecipeOrderBy, RecipeOrderDirection} from '../../services/requests';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-recipe-advanced-search-params',
  imports: [FormsModule, TranslatePipe],
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

  get prepTimeMin(): number | null {
    return this.recipeService.queryParams.prepTime?.min ?? null;
  }

  get prepTimeMax(): number | null {
    return this.recipeService.queryParams.prepTime?.max ?? null;
  }

  get countIngredientsMin(): number | null {
    return this.recipeService.queryParams.countIngredients?.min ?? null;
  }

  get countIngredientsMax(): number | null {
    return this.recipeService.queryParams.countIngredients?.max ?? null;
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

  setPrepTimeMin(value: string): void {
    const num = value !== '' ? parseInt(value) : undefined;
    this.recipeService.queryParams.prepTime = this.mergeRange(this.recipeService.queryParams.prepTime, 'min', num);
    this.recipeService.resetPage();
    this.recipeService.queryParamsChanged$.next();
  }

  setPrepTimeMax(value: string): void {
    const num = value !== '' ? parseInt(value) : undefined;
    this.recipeService.queryParams.prepTime = this.mergeRange(this.recipeService.queryParams.prepTime, 'max', num);
    this.recipeService.resetPage();
    this.recipeService.queryParamsChanged$.next();
  }

  setCountIngredientsMin(value: string): void {
    const num = value !== '' ? parseInt(value) : undefined;
    this.recipeService.queryParams.countIngredients = this.mergeRange(this.recipeService.queryParams.countIngredients, 'min', num);
    this.recipeService.resetPage();
    this.recipeService.queryParamsChanged$.next();
  }

  setCountIngredientsMax(value: string): void {
    const num = value !== '' ? parseInt(value) : undefined;
    this.recipeService.queryParams.countIngredients = this.mergeRange(this.recipeService.queryParams.countIngredients, 'max', num);
    this.recipeService.resetPage();
    this.recipeService.queryParamsChanged$.next();
  }

  private mergeRange(current: {min?: number; max?: number} | undefined, field: 'min' | 'max', value: number | undefined) {
    const updated = {...current, [field]: value};
    return updated.min == null && updated.max == null ? undefined : updated;
  }
}
