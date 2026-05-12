import {Component, computed, effect, inject, Input, OnInit, signal} from '@angular/core';
import {LanguageService} from '../../services/language.service';
import {RecipeSearchResponse} from '../../services/responses';
import {RecipeCompactCardComponent} from '../recipe-compact-card/recipe-compact-card.component';
import {MarkedRecipesService} from '../../services/marked-recipes.service';
import {loadFromStorage, saveToStorage} from './menu-viewer-editor-persisted';

@Component({
  selector: 'app-menu-viewer-editor',
  imports: [
    RecipeCompactCardComponent
  ],
  templateUrl: './menu-viewer-editor.component.html',
  styleUrl: './menu-viewer-editor.component.css'
})
export class MenuViewerEditorComponent implements OnInit {
  @Input()
  startInViewMode = false;

  languageService = inject(LanguageService);
  markedRecipesService = inject(MarkedRecipesService);

  isEditMode = signal(false);
  menuName = signal('');
  menuNameError = computed(() => {
    const len = this.menuName().trim().length;
    if (len < 2) return 'Name must be at least 2 characters.';
    if (len > 250) return 'Name must be at most 250 characters.';
    return null;
  });
  menuNameValid = computed(() => this.menuNameError() === null);
  menuDays = signal<RecipeSearchResponse[][]>([[], [], []]);
  numDays = computed(() => this.menuDays().length);
  daysValid = computed(() => this.menuDays().every(d => d.length >= 1 && d.length <= 10));
  canSave = computed(() => this.menuNameValid() && this.daysValid());
  selectedRecipe = signal<RecipeSearchResponse | null>(null);
  selectedFromDay = signal<{ recipe: RecipeSearchResponse; dayIndex: number; recipeIndex: number } | null>(null);

  constructor() {
    const saved = loadFromStorage();
    if (saved) {
      this.menuName.set(saved.menuName);
      this.menuDays.set(saved.menuDays);
    }
    effect(() => saveToStorage(this.menuName(), this.menuDays()));
  }

  toggleMode(): void {
    if (this.isEditMode() && !this.canSave()) return;
    this.isEditMode.update(v => !v);
    if (!this.isEditMode()) {
      this.selectedRecipe.set(null);
      this.selectedFromDay.set(null);
    }
  }

  ngOnInit(): void {
    this.languageService.getAllIfNeeded();
    this.isEditMode.set(this.markedRecipesService.markedRecipes().length > 0 && !this.startInViewMode);
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
    if (this.menuDays()[dayIndex].length >= 10) return;
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
    if (this.numDays() >= 15) return;
    this.menuDays.update(days => [...days, []]);
  }

  decreaseDays(): void {
    const days = this.menuDays();
    if (days.length <= 1) return;
    const removedDay = days[days.length - 1];
    removedDay.forEach(recipe => this.markedRecipesService.toggle(recipe));
    if (this.selectedFromDay()?.dayIndex === days.length - 1) {
      this.selectedFromDay.set(null);
    }
    this.menuDays.update(d => d.slice(0, -1));
  }
}
