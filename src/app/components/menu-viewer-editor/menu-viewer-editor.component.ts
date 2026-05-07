import {Component, computed, inject, model, OnInit, signal} from '@angular/core';
import {LanguageService} from '../../services/language.service';
import {RecipeSearchResponse} from '../../services/responses';
import {RecipeCompactCardComponent} from '../recipe-compact-card/recipe-compact-card.component';
import {MarkedRecipesService} from '../../services/marked-recipes.service';

@Component({
  selector: 'app-menu-viewer-editor',
  imports: [
    RecipeCompactCardComponent
  ],
  templateUrl: './menu-viewer-editor.component.html',
  styleUrl: './menu-viewer-editor.component.css'
})
export class MenuViewerEditorComponent implements OnInit {
  languageService = inject(LanguageService);
  markedRecipesService = inject(MarkedRecipesService);

  isEditMode = model(false);
  menuDays = signal<RecipeSearchResponse[][]>([[], [], []]);
  numDays = computed(() => this.menuDays().length);
  selectedRecipe = signal<RecipeSearchResponse | null>(null);

  toggleMode(): void {
    this.isEditMode.update(v => !v);
    if (!this.isEditMode()) {
      this.selectedRecipe.set(null);
    }
  }

  ngOnInit(): void {
    this.languageService.getAllIfNeeded();
  }

  selectRecipe(recipe: RecipeSearchResponse): void {
    this.selectedRecipe.update(current => current === recipe ? null : recipe);
  }

  placeInDay(dayIndex: number): void {
    const recipe = this.selectedRecipe();
    if (!recipe) return;
    this.menuDays.update(days =>
      days.map((d, i) => i === dayIndex ? [...d, recipe] : d)
    );
    this.selectedRecipe.set(null);
    this.markedRecipesService.remove(recipe);
  }

  removeFromDay(dayIndex: number, recipeIndex: number): void {
    this.menuDays.update(days =>
      days.map((d, i) => i === dayIndex ? d.filter((_, j) => j !== recipeIndex) : d)
    );
  }

  increaseDays(): void {
    this.menuDays.update(days => [...days, []]);
  }

  decreaseDays(): void {
    this.menuDays.update(days => days.length > 1 ? days.slice(0, -1) : days);
  }
}
