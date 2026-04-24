import {Component, inject} from '@angular/core';
import {IngredientsInputComponent} from '../ingredients-input/ingredients-input.component';
import {IngredientSearchAndCategoryUnion, unionIds} from '../../services/responses';
import {RecipeService} from '../../services/recipe.service';
import {debounceTime, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RecipeSearchRequest} from '../../services/requests';
import {IngredientGroupRelation, IngredientGroupWithRelation} from '../../services/common.data';
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

  get includedIngredientGroups(): IngredientSearchAndCategoryUnion[][] {
    return this.recipeService.includedIngredientGroups;
  }

  get excludedIngredients(): IngredientSearchAndCategoryUnion[] {
    return this.recipeService.excludedIngredients;
  }

  laneRelation(index: number): IngredientGroupRelation {
    return this.recipeService.laneRelations[index] ?? 'AND';
  }

  groupIngredientsChange(index: number, items: IngredientSearchAndCategoryUnion[]): void {
    this.recipeService.includedIngredientGroups[index] = items;
    this.rebuildQueryGroups();
    this.recipeService.determineConflictingIngredients();
    this.recipeService.resetPage();
    this.queryParamsChanged$.next();
  }

  addGroup(): void {
    this.recipeService.includedIngredientGroups.push([]);
    this.recipeService.laneRelations.push('AND');
  }

  removeGroup(index: number): void {
    this.recipeService.includedIngredientGroups.splice(index, 1);
    const relationIndex = Math.min(index, this.recipeService.laneRelations.length - 1);
    this.recipeService.laneRelations.splice(relationIndex, 1);
    this.rebuildQueryGroups();
    this.recipeService.determineConflictingIngredients();
    this.recipeService.resetPage();
    this.queryParamsChanged$.next();
  }

  toggleLaneRelation(index: number): void {
    const current = this.recipeService.laneRelations[index] ?? 'AND';
    this.recipeService.laneRelations[index] = current === 'AND' ? 'OR' : 'AND';
    this.rebuildQueryGroups();
    this.recipeService.resetPage();
    this.queryParamsChanged$.next();
  }

  excludedIngredientsChange(items: IngredientSearchAndCategoryUnion[]) {
    this.recipeService.excludedIngredients = items;

    if (items.length > 0) {
      this.queryParams.excludedIngredients = items.flatMap(unionIds);
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

  onCategoryMinMatchChange(): void {
    this.rebuildQueryGroups();
    this.recipeService.resetPage();
    this.queryParamsChanged$.next();
  }

  private rebuildQueryGroups(): void {
    const result: IngredientGroupWithRelation[] = [];
    const numOfGroups = this.recipeService.includedIngredientGroups.length;
    this.recipeService.includedIngredientGroups.forEach((lane, laneIndex) => {
      const laneRelation = numOfGroups > 1 && laneIndex < numOfGroups - 1 ? this.laneRelation(laneIndex) : undefined;
      result.push(...this.toGroupsWithRelation(lane, laneRelation));
    });
    this.queryParams.includedIngredientGroups = result.length > 0 ? result : undefined;
  }

  private toGroupsWithRelation(
    items: IngredientSearchAndCategoryUnion[],
    laneRelation?: IngredientGroupRelation
  ): IngredientGroupWithRelation[] {
    const categories = items.filter(u => u.category);
    const ingredients = items.filter(u => u.ingredient);

    const categoriesAsGroups = categories.map<IngredientGroupWithRelation>((c) => ({
      group: {
        ids: unionIds(c),
        minMatch: this.recipeService.categoryMinMatch[c.category!.id] ?? 1,
        asPercent: this.recipeService.categoryAsPercent[c.category!.id] ?? false
      },
      relation: 'AND'
    }));

    const ingredientIds = ingredients.flatMap(i => unionIds(i));
    const result = [...categoriesAsGroups];
    if (ingredientIds.length > 0) {
      result.push({group: {ids: ingredientIds, minMatch: ingredientIds.length}});
    }

    if (result.length > 0 && laneRelation) {
      result[result.length - 1]["relation"] = laneRelation;
    }

    return result;
  }

  private filterByNameChange(value: string) {
    if (value.length >= 2 || value.length == 0) {
      this.queryParams.filterByName = value;
      this.recipeService.resetPage();
      this.queryParamsChanged$.next();
    }
  }
}
