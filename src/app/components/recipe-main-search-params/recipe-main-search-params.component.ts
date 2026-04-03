import { Component, model } from '@angular/core';
import {TagsInputComponent} from "../tags-input/tags-input.component";

@Component({
  selector: 'app-recipe-main-search-params',
    imports: [
        TagsInputComponent
    ],
  templateUrl: './recipe-main-search-params.component.html',
  styleUrl: './recipe-main-search-params.component.css'
})
export class RecipeMainSearchParamsComponent {
  filterByName = model('');
}
