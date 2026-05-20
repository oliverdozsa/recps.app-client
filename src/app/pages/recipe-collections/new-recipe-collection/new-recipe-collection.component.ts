import { Component } from '@angular/core';
import {MarkedRecipesComponent} from '../../../components/marked-recipes/marked-recipes.component';

@Component({
  selector: 'app-new-recipe-collection',
  imports: [
    MarkedRecipesComponent
  ],
  templateUrl: './new-recipe-collection.component.html',
  styleUrl: './new-recipe-collection.component.css'
})
export class NewRecipeCollectionComponent {

}
