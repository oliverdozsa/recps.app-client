import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {RecipeCompactCardComponent} from "../recipe-compact-card/recipe-compact-card.component";
import {MarkedRecipesService} from '../../services/marked-recipes.service';
import {RecipeSearchResponse} from '../../services/responses';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-marked-recipes',
  imports: [
    RecipeCompactCardComponent,
    TranslatePipe
  ],
  templateUrl: './marked-recipes.component.html',
  styleUrl: './marked-recipes.component.css'
})
export class MarkedRecipesComponent {
  markedRecipesService = inject(MarkedRecipesService);

  @Input()
  displayFully = false;

  @Input()
  disableSelection = false;

  @Input()
  showAddButton = false;

  @Output()
  onRecipeSelected = new EventEmitter<RecipeSearchResponse | null>();

  @Output()
  onRecipeAdded = new EventEmitter<RecipeSearchResponse>();

  selected: RecipeSearchResponse | null = null;

  constructor() {
    this.markedRecipesService.selectedRecipeCleared$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.selected = null);
  }

  onRecipeClicked(recipe: RecipeSearchResponse) {
    if (this.disableSelection) return;

    this.selected = recipe == this.selected ? null : recipe;
    this.onRecipeSelected.emit(this.selected);
  }

  onRecipeDeleteClicked(recipe: RecipeSearchResponse) {
    this.markedRecipesService.remove(recipe);
  }

  onRecipeAddClicked(recipe: RecipeSearchResponse) {
    this.onRecipeAdded.emit(recipe);
  }

  clearAll() {
    this.markedRecipesService.clear();
    this.selected = null;
    this.onRecipeSelected.emit(null);
  }
}
