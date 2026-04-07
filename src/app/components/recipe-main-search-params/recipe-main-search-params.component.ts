import { Component, model } from '@angular/core';
import {TagsInputComponent} from "../tags-input/tags-input.component";
import {IngredientsInputComponent} from '../ingredients-input/ingredients-input.component';
import {IngredientSearchResponse} from '../../services/responses';

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
  filterByName = model('');
  includedIngredients = model<IngredientSearchResponse[]>([]);
  excludedIngredients = model<IngredientSearchResponse[]>([]);


}
