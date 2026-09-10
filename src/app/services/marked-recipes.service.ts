import {Injectable, signal} from '@angular/core';
import {RecipeSearchResponse} from './responses';
import {Subject} from 'rxjs';

const STORAGE_KEY = 'recps.markedRecipes';
const STORAGE_KEY_LAST_ACTIVITY = 'recps.markedRecipes.lastActivity';
const TTL_MS = 60 * 60 * 1000;

@Injectable({providedIn: 'root'})
export class MarkedRecipesService {
  private _markedRecipes = signal<RecipeSearchResponse[]>(this.loadFromStorage());

  readonly markedRecipes = this._markedRecipes.asReadonly();

  selectedRecipeCleared$ = new Subject<void>();

  isMarked(recipe: RecipeSearchResponse): boolean {
    return this._markedRecipes().some(r => r.id === recipe.id);
  }

  toggle(recipe: RecipeSearchResponse): void {
    this._markedRecipes.update(recipes => {
      const updated = recipes.some(r => r.id === recipe.id)
        ? recipes.filter(r => r.id !== recipe.id)
        : [...recipes, recipe];
      this.persist(updated);
      return updated;
    });
  }

  mark(recipe: RecipeSearchResponse) {
    if (this.isMarked(recipe)) return;
    this.toggle(recipe);
  }

  remove(recipe: RecipeSearchResponse) {
    this._markedRecipes.update(recipes => {
      const updated = recipes.filter(r => r.id !== recipe.id);
      this.persist(updated);
      return updated;
    });
  }

  clear() {
    this._markedRecipes.set([]);
    this.persist([]);
  }

  private persist(recipes: RecipeSearchResponse[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, String(Date.now()));
  }

  private loadFromStorage(): RecipeSearchResponse[] {
    try {
      const lastActivity = Number(localStorage.getItem(STORAGE_KEY_LAST_ACTIVITY));
      if (!lastActivity || Date.now() - lastActivity >= TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY_LAST_ACTIVITY);
        return [];
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
