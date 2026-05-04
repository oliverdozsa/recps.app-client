import {Component, Input, signal} from '@angular/core';
import {RecipeSearchResponse} from '../../services/responses';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-recipe-compact-card',
  imports: [
    TranslatePipe
  ],
  templateUrl: './recipe-compact-card.component.html',
  styleUrl: './recipe-compact-card.component.css'
})
export class RecipeCompactCardComponent {
  @Input()
  recipe!: RecipeSearchResponse;

  imageError = signal(false);
}
