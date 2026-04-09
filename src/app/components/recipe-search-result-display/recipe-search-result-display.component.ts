import {Component, inject, input} from '@angular/core';
import {RecipeSearchResponse} from '../../services/responses';
import {RecipeCardComponent} from '../recipe-card/recipe-card.component';
import {RecipeService} from '../../services/recipe.service';

@Component({
  selector: 'app-recipe-search-result-display',
  imports: [RecipeCardComponent],
  templateUrl: './recipe-search-result-display.component.html',
  styleUrl: './recipe-search-result-display.component.css'
})
export class RecipeSearchResultDisplayComponent {
  private recipeService = inject(RecipeService);

  get areConflictingIngredientsPresent() {
    return this.recipeService.conflictingIngredients.size > 0;
  }

  recipes = input<RecipeSearchResponse[]>([]);
}
