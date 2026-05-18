import {Component, EventEmitter, inject, Output} from '@angular/core';
import {RecipeCompactCardComponent} from "../recipe-compact-card/recipe-compact-card.component";
import {MarkedRecipesService} from '../../services/marked-recipes.service';
import {RecipeSearchResponse} from '../../services/responses';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-marked-recipes',
  imports: [
    RecipeCompactCardComponent
  ],
  templateUrl: './marked-recipes.component.html',
  styleUrl: './marked-recipes.component.css'
})
export class MarkedRecipesComponent {
  markedRecipesService = inject(MarkedRecipesService);

  @Output()
  onRecipeSelected = new EventEmitter<RecipeSearchResponse | null>();

  selected: RecipeSearchResponse | null = null;

  constructor() {
    this.markedRecipesService.selectedRecipeCleared$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.selected = null);
  }

  onRecipeClicked(recipe: RecipeSearchResponse) {
    this.selected = recipe == this.selected ? null : recipe;
    this.onRecipeSelected.emit(this.selected);
  }

  clearAll() {
    this.markedRecipesService.clear();
    this.selected = null;
    this.onRecipeSelected.emit(null);
  }
}
