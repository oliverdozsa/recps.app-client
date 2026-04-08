import {Component, inject, model} from '@angular/core';
import {TagsInputComponent} from "../tags-input/tags-input.component";
import {IngredientsInputComponent} from '../ingredients-input/ingredients-input.component';
import {IngredientSearchResponse as Ingredient} from '../../services/responses';
import {RecipeService} from '../../services/recipe.service';
import {debounceTime, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
  private filterByNameDebounced$ = new Subject<string>()

  constructor() {
    this.filterByNameDebounced$
      .pipe(debounceTime(300),takeUntilDestroyed())
      .subscribe(value => this.filterByNameChange(value));
  }

  get filterByName(): string {
    return this.recipeService.queryParams.filterByName ? this.recipeService.queryParams.filterByName : "";
  }

  includedIngredientsChange(ingredients: Ingredient[]) {
    // TODO
  }

  excludedIngredientsChange(ingredients: Ingredient[]) {
    // TODO
  }

  filterByNameRawChange(value: string) {
    this.filterByNameDebounced$.next(value);
  }

  private filterByNameChange(value: string) {
    if(value.length >= 2 || value.length == 0) {
      this.recipeService.queryParams.filterByName = value;
      this.recipeService.queryParamsChanged$.next();
    }
  }
}
