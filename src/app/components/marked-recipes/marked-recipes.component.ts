import {ChangeDetectionStrategy, Component, inject, input, output, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {MarkedRecipesService} from '../../services/marked-recipes.service';
import {RecipeCompactCardComponent} from '../recipe-compact-card/recipe-compact-card.component';
import {Recipe} from '../../models/recipe.model';

@Component({
  selector: 'app-marked-recipes',
  standalone: true,
  imports: [TranslatePipe, RecipeCompactCardComponent],
  templateUrl: './marked-recipes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkedRecipesComponent {
  markedRecipesService = inject(MarkedRecipesService);

  displayFully = input(false);
  disableSelection = input(false);
  showAddButton = input(false);

  recipeSelected = output<Recipe | null>();
  recipeAdded = output<Recipe>();

  selected = signal<Recipe | null>(null);

  constructor() {
    this.markedRecipesService.selectedRecipeCleared$.subscribe(() => this.selected.set(null));
  }

  onRecipeClicked(recipe: Recipe) {
    if (this.disableSelection()) return;
    const next = this.selected()?.id === recipe.id ? null : recipe;
    this.selected.set(next);
    this.recipeSelected.emit(next);
  }

  onDeleteClicked(recipe: Recipe) {
    this.markedRecipesService.remove(recipe);
  }

  onAddClicked(recipe: Recipe) {
    this.recipeAdded.emit(recipe);
  }

  clearAll() {
    this.markedRecipesService.clear();
    this.selected.set(null);
    this.recipeSelected.emit(null);
  }
}
