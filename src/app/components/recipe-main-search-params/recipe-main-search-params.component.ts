import {Component, inject} from '@angular/core';
import {IngredientsInputComponent} from '../ingredients-input/ingredients-input.component';
import {IngredientSearchResponse} from '../../services/responses';
import {RecipeService} from '../../services/recipe.service';
import {debounceTime, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RecipeSearchRequest} from '../../services/requests';
import {IngredientGroup, IngredientGroupWithRelation} from '../../services/common.data';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-recipe-main-search-params',
  imports: [
    IngredientsInputComponent,
    TranslatePipe
  ],
  templateUrl: './recipe-main-search-params.component.html',
  styleUrl: './recipe-main-search-params.component.css'
})
export class RecipeMainSearchParamsComponent {
  private recipeService = inject(RecipeService);
  private filterByNameDebounced$ = new Subject<string>();
  private queryParams: RecipeSearchRequest;
  private queryParamsChanged$: Subject<void>;

  constructor() {
    this.queryParams = this.recipeService.queryParams;
    this.queryParamsChanged$ = this.recipeService.queryParamsChanged$;

    this.filterByNameDebounced$
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe(value => this.filterByNameChange(value));
  }

  get filterByName(): string {
    return this.queryParams.filterByName ? this.queryParams.filterByName : "";
  }

  get includedIngredients(): IngredientSearchResponse[] {
    return this.recipeService.includedIngredients;
  }

  get excludedIngredients(): IngredientSearchResponse[] {
    return this.recipeService.excludedIngredients;
  }

  includedIngredientsChange(ingredients: IngredientSearchResponse[]) {
    this.recipeService.includedIngredients = ingredients;

    if (ingredients.length > 0) {
      const ingredientGroup: IngredientGroup = {
        ids: ingredients.map(i => i.ingredientId),
        minMatch: ingredients.length
      }

      const groupWithRelation: IngredientGroupWithRelation = {
        group: ingredientGroup
      };

      this.queryParams.includedIngredientGroups = [groupWithRelation];
    } else {
      this.queryParams.includedIngredientGroups = undefined;
    }

    this.recipeService.determineConflictingIngredients();
    this.recipeService.resetPage();
    this.queryParamsChanged$.next();
  }

  excludedIngredientsChange(ingredients: IngredientSearchResponse[]) {
    this.recipeService.excludedIngredients = ingredients;

    if(ingredients.length > 0) {
      this.queryParams.excludedIngredients = ingredients.map(i => i.ingredientId);
    } else {
      this.queryParams.excludedIngredients = undefined;
    }

    this.recipeService.determineConflictingIngredients();
    this.recipeService.resetPage();
    this.queryParamsChanged$.next();
  }

  filterByNameRawChange(value: string) {
    this.filterByNameDebounced$.next(value);
  }

  private filterByNameChange(value: string) {
    if (value.length >= 2 || value.length == 0) {
      this.queryParams.filterByName = value;
      this.recipeService.resetPage();
      this.queryParamsChanged$.next();
    }
  }
}
