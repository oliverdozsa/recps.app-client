import { Component } from '@angular/core';
import {TagsInputComponent} from '../../components/tags-input/tags-input.component';
import {
  RecipeSearchResultDisplayComponent
} from '../../components/recipe-search-result-display/recipe-search-result-display.component';

@Component({
  selector: 'app-home',
  imports: [
    TagsInputComponent,
    RecipeSearchResultDisplayComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
