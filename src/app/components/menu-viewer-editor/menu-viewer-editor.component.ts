import {ChangeDetectionStrategy, Component, computed, effect, inject, input, signal} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {MenuService} from '../../services/menu.service';
import {MarkedRecipesService} from '../../services/marked-recipes.service';
import {Recipe} from '../../models/recipe.model';
import {MarkedRecipesComponent} from '../marked-recipes/marked-recipes.component';
import {RecipeCompactCardComponent} from '../recipe-compact-card/recipe-compact-card.component';
import {MenuGenerateModalComponent} from '../menu-generate-modal/menu-generate-modal.component';
import {clearFromStorage, loadFromStorage, saveToStorage} from './menu-viewer-editor-persisted';

interface FromDaySelection {
  recipe: Recipe;
  dayIndex: number;
  recipeIndex: number;
}

@Component({
  selector: 'app-menu-viewer-editor',
  standalone: true,
  imports: [FormsModule, TranslatePipe, MarkedRecipesComponent, RecipeCompactCardComponent, MenuGenerateModalComponent],
  templateUrl: './menu-viewer-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuViewerEditorComponent {
  private menuService = inject(MenuService);
  private markedRecipesService = inject(MarkedRecipesService);
  private router = inject(Router);

  startInViewMode = input(false);
  menuId = input<number | null>(null);
  initialMenuName = input('');
  initialMenuDays = input<Recipe[][] | null>(null);

  menuName = signal('');
  menuDays = signal<Recipe[][]>([[], [], []]);
  isEditMode = signal(false);
  saving = signal(false);
  selectedRecipe = signal<Recipe | null>(null);
  selectedFromDay = signal<FromDaySelection | null>(null);
  showGenerateModal = signal(false);
  showIngredientsModal = signal(false);
  copied = signal(false);

  numDays = computed(() => this.menuDays().length);
  daysValid = computed(() => this.menuDays().every(day => day.length >= 1 && day.length <= 10));
  menuNameValid = computed(() => {
    const len = this.menuName().trim().length;
    return len >= 2 && len <= 250;
  });
  menuNameError = computed(() => {
    const len = this.menuName().trim().length;
    if (len < 2) return 'menuEditor.nameTooShort';
    if (len > 250) return 'menuEditor.nameTooLong';
    return null;
  });
  canSave = computed(() => this.menuNameValid() && this.daysValid());
  allIngredients = computed(() => {
    const names = new Set<string>();
    this.menuDays().flat().forEach(recipe => {
      (recipe.ingredients ?? []).forEach(ing => {
        const name = ing.names?.[0]?.name;
        if (name) names.add(name);
      });
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  });

  constructor() {
    this.isEditMode.set(!this.startInViewMode());
    const initialDays = this.initialMenuDays();
    this.menuName.set(this.initialMenuName());

    if (initialDays !== null) {
      this.menuDays.set(initialDays);
    } else {
      const draft = loadFromStorage();
      if (draft) {
        this.menuName.set(draft.menuName);
        this.menuDays.set(draft.menuDays);
      }
    }

    effect(() => {
      const name = this.menuName();
      const days = this.menuDays();
      if (this.initialMenuDays() === null) {
        saveToStorage(name, days);
      }
    });

    effect(() => {
      if (this.selectedRecipe() === null) {
        this.markedRecipesService.selectedRecipeCleared$.next();
      }
    });
  }

  selectRecipe(recipe: Recipe | null) {
    this.selectedFromDay.set(null);
    this.selectedRecipe.set(recipe);
  }

  selectFromDay(recipe: Recipe, dayIndex: number, recipeIndex: number) {
    const current = this.selectedFromDay();
    if (current && current.dayIndex === dayIndex && current.recipeIndex === recipeIndex) {
      this.selectedFromDay.set(null);
    } else {
      this.selectedFromDay.set({recipe, dayIndex, recipeIndex});
    }
    this.selectedRecipe.set(null);
  }

  onDayCardClick(dayIndex: number) {
    if (!this.isEditMode()) return;
    if (this.selectedRecipe()) {
      this.placeInDay(dayIndex);
    } else if (this.selectedFromDay()) {
      this.moveToDay(dayIndex);
    }
  }

  placeInDay(dayIndex: number) {
    const recipe = this.selectedRecipe();
    if (!recipe) return;
    this.menuDays.update(days => {
      const next = days.map(d => [...d]);
      if (next[dayIndex].length >= 10) return days;
      next[dayIndex].push(recipe);
      return next;
    });
    this.markedRecipesService.remove(recipe);
    this.selectedRecipe.set(null);
  }

  moveToDay(targetDayIndex: number) {
    const selection = this.selectedFromDay();
    if (!selection) return;
    if (selection.dayIndex === targetDayIndex) {
      this.selectedFromDay.set(null);
      return;
    }
    this.menuDays.update(days => {
      const next = days.map(d => [...d]);
      next[selection.dayIndex].splice(selection.recipeIndex, 1);
      next[targetDayIndex].push(selection.recipe);
      return next;
    });
    this.selectedFromDay.set(null);
  }

  moveBackToPool(recipe: Recipe, dayIndex: number, recipeIndex: number) {
    this.removeFromDay(dayIndex, recipeIndex);
    this.markedRecipesService.mark(recipe);
  }

  removeFromDay(dayIndex: number, recipeIndex: number) {
    this.menuDays.update(days => {
      const next = days.map(d => [...d]);
      next[dayIndex].splice(recipeIndex, 1);
      return next;
    });
    const selection = this.selectedFromDay();
    if (selection && selection.dayIndex === dayIndex && selection.recipeIndex === recipeIndex) {
      this.selectedFromDay.set(null);
    }
  }

  increaseDays() {
    if (this.numDays() >= 15) return;
    this.menuDays.update(days => [...days, []]);
  }

  decreaseDays() {
    if (this.numDays() <= 1) return;
    this.menuDays.update(days => {
      const removed = days[days.length - 1];
      removed.forEach(recipe => this.markedRecipesService.mark(recipe));
      return days.slice(0, -1);
    });
  }

  toggleMode() {
    this.isEditMode.update(v => !v);
    if (!this.isEditMode()) {
      this.selectedRecipe.set(null);
      this.selectedFromDay.set(null);
    }
  }

  onGenerated(recipes: (Recipe | null)[]) {
    this.menuDays.update(days => days.map((day, i) => {
      const recipe = recipes[i];
      if (!recipe || day.length >= 10) return day;
      return [...day, recipe];
    }));
    this.showGenerateModal.set(false);
  }

  toggleIngredientsModal() {
    this.showIngredientsModal.update(v => !v);
  }

  copyIngredients() {
    navigator.clipboard.writeText(this.allIngredients().join('\n')).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  save() {
    if (!this.canSave()) return;
    this.saving.set(true);
    const request = {
      name: this.menuName().trim(),
      recipeIds: this.menuDays().map(day => day.map(r => r.id!))
    };
    const id = this.menuId();
    const request$ = id !== null ? this.menuService.update(id, request) : this.menuService.create(request);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.isEditMode.set(false);
        if (id === null) {
          this.markedRecipesService.clear();
          clearFromStorage();
          this.router.navigate(['/menu']);
        }
      },
      error: () => this.saving.set(false)
    });
  }
}
