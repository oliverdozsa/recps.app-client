import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {LanguageService} from '../../services/language.service';
import {RecipeSearchResponse} from '../../services/responses';
import {RecipeCompactCardComponent} from '../../components/recipe-compact-card/recipe-compact-card.component';

const MOCK_RECIPES: RecipeSearchResponse[] = [
  {id: 1, name: 'Spaghetti Carbonara', url: 'https://example.com', cookingTime: 30, sourcePage: 'italianfood.com', ingredients: []},
  {id: 2, name: 'Chicken Tikka Masala', url: 'https://example.com', cookingTime: 45, sourcePage: 'indianrecipes.com', ingredients: []},
  {id: 3, name: 'Greek Salad', url: 'https://example.com', cookingTime: 15, sourcePage: 'greekfood.com', ingredients: []},
  {id: 4, name: 'Beef Stir Fry', url: 'https://example.com', cookingTime: 25, sourcePage: 'asianfusion.com', ingredients: []},
  {id: 5, name: 'Margherita Pizza', url: 'https://example.com', cookingTime: 40, sourcePage: 'pizzaplace.com', ingredients: []},
];

@Component({
  selector: 'app-menu',
  imports: [RecipeCompactCardComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  languageService = inject(LanguageService);

  markedRecipes: RecipeSearchResponse[] = MOCK_RECIPES;
  menuDays = signal<RecipeSearchResponse[][]>([[], [], []]);
  numDays = computed(() => this.menuDays().length);
  selectedRecipe = signal<RecipeSearchResponse | null>(null);

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
  }

  removeFromDay(dayIndex: number, recipeIndex: number, event: Event): void {
    event.stopPropagation();
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
