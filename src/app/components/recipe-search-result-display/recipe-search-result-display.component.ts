import { Component, input } from '@angular/core';
import {RecipeSearchResponse} from '../../services/responses';
import {RecipeCardComponent} from '../recipe-card/recipe-card.component';

@Component({
  selector: 'app-recipe-search-result-display',
  imports: [RecipeCardComponent],
  templateUrl: './recipe-search-result-display.component.html',
  styleUrl: './recipe-search-result-display.component.css'
})
export class RecipeSearchResultDisplayComponent {
  recipes = input<RecipeSearchResponse[]>([]);
}
