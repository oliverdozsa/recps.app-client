import {ChangeDetectionStrategy, Component, input, output, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {Recipe} from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-compact-card',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './recipe-compact-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeCompactCardComponent {
  recipe = input.required<Recipe>();
  selected = input(false);
  editMode = input(false);
  deleteMode = input(false);
  addMode = input(false);

  backClicked = output<void>();
  deleteClicked = output<void>();
  addClicked = output<void>();

  imageError = signal(false);

  onImageError() {
    this.imageError.set(true);
  }
}
