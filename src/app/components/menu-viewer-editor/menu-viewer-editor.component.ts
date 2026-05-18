import {Component, computed, effect, inject, Input, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {LanguageService} from '../../services/language.service';
import {RecipeSearchResponse} from '../../services/responses';
import {RecipeCompactCardComponent} from '../recipe-compact-card/recipe-compact-card.component';
import {MarkedRecipesService} from '../../services/marked-recipes.service';
import {MenuService} from '../../services/menu.service';
import {loadFromStorage, saveToStorage, clearFromStorage} from './menu-viewer-editor-persisted';
import {MarkedRecipesComponent} from '../marked-recipes/marked-recipes.component';

@Component({
  selector: 'app-menu-viewer-editor',
  imports: [
    RecipeCompactCardComponent,
    MarkedRecipesComponent
  ],
  templateUrl: './menu-viewer-editor.component.html',
  styleUrl: './menu-viewer-editor.component.css'
})
export class MenuViewerEditorComponent implements OnInit {
  @Input() startInViewMode = false;
  @Input() menuId: number | null = null;
  @Input() initialMenuName = '';
  @Input() initialMenuDays: RecipeSearchResponse[][] | null = null;

  languageService = inject(LanguageService);
  markedRecipesService = inject(MarkedRecipesService);
  private menuService = inject(MenuService);
  private router = inject(Router);

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
  saving = signal(false);

  constructor() {
    effect(() => {
      if (this.menuId === null) {
        saveToStorage(this.menuName(), this.menuDays());
      }
    });

    effect(() => {
      if(this.selectedRecipe() === null) {
        this.markedRecipesService.selectedRecipeCleared$.next();
      }
    })
  }

  toggleMode(): void {
    this.isEditMode.update(v => !v);
    if (!this.isEditMode()) {
      this.selectedRecipe.set(null);
      this.selectedFromDay.set(null);
    }
  }

  save(): void {
    if (!this.canSave()) return;
    this.saving.set(true);
    const request = {
      name: this.menuName().trim(),
      recipeIds: this.menuDays().map(day => day.map(r => r.id!)),
    };
    const obs = this.menuId !== null
      ? this.menuService.update(this.menuId, request)
      : this.menuService.create(request);
    obs.subscribe({
      next: () => {
        this.toggleMode();
        this.saving.set(false);
        if (this.menuId == null) {
          this.markedRecipesService.clear();
          clearFromStorage();
          this.router.navigate(['/menu'])
        }
      },
      error: () => this.saving.set(false),
    });
  }

  ngOnInit(): void {
    this.languageService.getAllIfNeeded();
    if (this.initialMenuDays !== null) {
      this.menuName.set(this.initialMenuName);
      this.menuDays.set(this.initialMenuDays);
    } else {
      const saved = loadFromStorage();
      if (saved) {
        this.menuName.set(saved.menuName);
        this.menuDays.set(saved.menuDays);
      }
    }
    this.isEditMode.set(!this.startInViewMode);
  }

  selectRecipe(recipe: RecipeSearchResponse | null): void {
    this.selectedFromDay.set(null);
    this.selectedRecipe.set(recipe);
  }

  selectFromDay(recipe: RecipeSearchResponse, dayIndex: number, recipeIndex: number): void {
    this.selectedRecipe.set(null);
    this.selectedFromDay.update(current =>
      current?.recipe === recipe ? null : {recipe, dayIndex, recipeIndex}
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

  moveBackToPool(recipe: RecipeSearchResponse, dayIndex: number, recipeIndex: number): void {
    this.removeFromDay(dayIndex, recipeIndex);
    this.markedRecipesService.toggle(recipe);
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

    if (this.selectedFromDay() && this.selectedFromDay()?.recipe.id === recipe.id) {
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
