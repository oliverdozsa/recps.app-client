import {Injectable, signal} from '@angular/core';
import {RecipeSearchResponse} from './responses';

const STORAGE_KEY = 'recps.markedRecipes';

@Injectable({providedIn: 'root'})
export class MarkedRecipesService {
  private _markedRecipes = signal<RecipeSearchResponse[]>(this.loadFromStorage());

  readonly markedRecipes = this._markedRecipes.asReadonly();

  isMarked(recipe: RecipeSearchResponse): boolean {
    return this._markedRecipes().some(r => r.id === recipe.id);
  }

  toggle(recipe: RecipeSearchResponse): void {
    this._markedRecipes.update(recipes => {
      const updated = recipes.some(r => r.id === recipe.id)
        ? recipes.filter(r => r.id !== recipe.id)
        : [...recipes, recipe];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  remove(recipe: RecipeSearchResponse) {
    this._markedRecipes.update(recipes => {
      return recipes.filter(r => r.id != recipe.id)
    });
  }

  private loadFromStorage(): RecipeSearchResponse[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
