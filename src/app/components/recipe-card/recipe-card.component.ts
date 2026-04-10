import {Component, input} from '@angular/core';
import {RecipeSearchResponse} from '../../services/responses';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-recipe-card',
  imports: [
    TranslatePipe
  ],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.css'
})
export class RecipeCardComponent {
  recipe = input.required<RecipeSearchResponse>();
}
