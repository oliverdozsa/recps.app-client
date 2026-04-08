import {Component, inject} from '@angular/core';
import {TagsInputComponent} from "../tags-input/tags-input.component";
import {IngredientsInputComponent} from '../ingredients-input/ingredients-input.component';
import {IngredientSearchResponse} from '../../services/responses';
import {RecipeService} from '../../services/recipe.service';
import {debounceTime, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RecipeSearchRequest} from '../../services/requests';
import {IngredientGroup, IngredientGroupWithRelation} from '../../services/common.data';

@Component({
  selector: 'app-recipe-main-search-params',
  imports: [
    TagsInputComponent,
    IngredientsInputComponent
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
      .pipe(debounceTime(300),takeUntilDestroyed())
      .subscribe(value => this.filterByNameChange(value));
  }

  get filterByName(): string {
    return this.queryParams.filterByName ? this.queryParams.filterByName : "";
  }

  includedIngredientsChange(ingredients: IngredientSearchResponse[]) {
    if(ingredients.length > 0){
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

    this.recipeService.queryParamsChanged$.next();
  }

  excludedIngredientsChange(ingredients: IngredientSearchResponse[]) {
    // TODO
  }

  filterByNameRawChange(value: string) {
    this.filterByNameDebounced$.next(value);
  }

  private filterByNameChange(value: string) {
    if(value.length >= 2 || value.length == 0) {
      this.queryParams.filterByName = value;
      this.queryParamsChanged$.next();
    }
  }
}
