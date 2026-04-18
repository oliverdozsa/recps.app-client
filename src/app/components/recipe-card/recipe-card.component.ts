import {Component, computed, inject, input} from '@angular/core';
import {RecipeSearchResponse, unionIds} from '../../services/responses';
import {TranslatePipe} from '@ngx-translate/core';
import {RecipeService} from '../../services/recipe.service';
import {Ingredient} from '../../services/common.data';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-recipe-card',
  imports: [
    TranslatePipe,
    NgClass
  ],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.css'
})
export class RecipeCardComponent {
  private recipeService = inject(RecipeService);

  recipe = input.required<RecipeSearchResponse>();
  ingredients = computed(() => {
    const ingredients = this.recipe().ingredients;
    ingredients.sort((a, b) => this.compareIngredients(a, b));
    return ingredients;
  })

  getBadgeClassOf(ingredient: Ingredient) {
    const rank = this.getRankOf(ingredient);

    if (rank == 0) {
      return "badge-primary";
    }

    return "badge-outline badge-primary";
  }

  private compareIngredients(a: Ingredient, b: Ingredient) {
    return this.getRankOf(a) - this.getRankOf(b);
  }

  private getRankOf(ingredient: Ingredient) {
    const includedIds = this.recipeService.includedIngredients.flatMap(unionIds);
    if (includedIds.includes(ingredient.id)) {
      return 0;
    }

    return 1;
  }
}
