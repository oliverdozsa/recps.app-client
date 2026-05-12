import {Component, computed, inject, OnInit, signal} from '@angular/core';
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

  isEditMode = signal(false);
  menuName = signal('');
  menuDays = signal<RecipeSearchResponse[][]>([[], [], []]);
  numDays = computed(() => this.menuDays().length);
  selectedRecipe = signal<RecipeSearchResponse | null>(null);
  selectedFromDay = signal<{ recipe: RecipeSearchResponse; dayIndex: number; recipeIndex: number } | null>(null);

  toggleMode(): void {
    this.isEditMode.update(v => !v);
    if (!this.isEditMode()) {
      this.selectedRecipe.set(null);
      this.selectedFromDay.set(null);
    }
  }

  ngOnInit(): void {
    this.languageService.getAllIfNeeded();
    this.isEditMode.set(this.markedRecipesService.markedRecipes().length > 0);
  }

  selectRecipe(recipe: RecipeSearchResponse): void {
    this.selectedFromDay.set(null);
    this.selectedRecipe.update(current => current === recipe ? null : recipe);
  }

  selectFromDay(recipe: RecipeSearchResponse, dayIndex: number, recipeIndex: number): void {
    this.selectedRecipe.set(null);
    this.selectedFromDay.update(current =>
      current?.recipe === recipe ? null : { recipe, dayIndex, recipeIndex }
    );
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

  moveBackToPool(): void {
    const sel = this.selectedFromDay();
    if (!sel) return;
    this.removeFromDay(sel.dayIndex, sel.recipeIndex);
    this.markedRecipesService.toggle(sel.recipe);
    this.selectedFromDay.set(null);
  }

  moveToDay(targetDayIndex: number): void {
    const sel = this.selectedFromDay();
    if (!sel || sel.dayIndex === targetDayIndex) return;
    this.menuDays.update(days =>
      days.map((d, i) => {
        if (i === sel.dayIndex) return d.filter((_, j) => j !== sel.recipeIndex);
        if (i === targetDayIndex) return [...d, sel.recipe];
        return d;
      })
    );
    this.selectedFromDay.set(null);
  }

  onDayCardClick(dayIndex: number): void {
    if (!this.isEditMode()) return;
    if (this.selectedRecipe() !== null) {
      this.placeInDay(dayIndex);
    } else if (this.selectedFromDay() !== null) {
      this.moveToDay(dayIndex);
    }
  }

  removeFromDay(dayIndex: number, recipeIndex: number): void {
    const recipe = this.menuDays()[dayIndex][recipeIndex];

    if(this.selectedFromDay() && this.selectedFromDay()?.recipe.id === recipe.id) {
      this.selectedFromDay.set(null);
    }

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
