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
}
