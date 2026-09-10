import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {RecipeCardComponent} from '../recipe-card/recipe-card.component';
import {EmptyStateComponent} from '../empty-state/empty-state.component';
import {Recipe} from '../../models/recipe.model';
import {Chip} from '../../models/chip.model';

@Component({
  selector: 'app-recipe-grid',
  standalone: true,
  imports: [RecipeCardComponent, EmptyStateComponent],
  templateUrl: './recipe-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeGridComponent {
  recipes = input<Recipe[]>([]);
  loading = input<boolean>(false);
  matchedIngredientIds = input<Set<number>>(new Set());
  languageIso = input<string>('hu');
  excludeChips = input<Chip[]>([]);
  removeExclude = output<Chip>();
  clearFilters = output<void>();

  skeletonItems = Array.from({length: 9});
}
