import { Component, inject, signal } from '@angular/core';
import {TagsInputComponent} from '../../components/tags-input/tags-input.component';
import {
  RecipeSearchResultDisplayComponent
} from '../../components/recipe-search-result-display/recipe-search-result-display.component';
import {
  RecipeAdvancedSearchParamsComponent
} from '../../components/recipe-advanced-search-params/recipe-advanced-search-params.component';
import {
  RecipeMainSearchParamsComponent
} from '../../components/recipe-main-search-params/recipe-main-search-params.component';
import {RecipeService} from '../../services/recipe.service';
import {RecipeSearchResponse} from '../../services/responses';

@Component({
  selector: 'app-home',
  imports: [
    RecipeSearchResultDisplayComponent,
    RecipeAdvancedSearchParamsComponent,
    RecipeMainSearchParamsComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private recipeService = inject(RecipeService);

  filterByName = signal('');
  recipes = signal<RecipeSearchResponse[]>([]);

  search(): void {
    this.recipeService.search({ filterByName: this.filterByName() }).subscribe(response => {
      this.recipes.set(response.items ?? []);
    });
  }
}
