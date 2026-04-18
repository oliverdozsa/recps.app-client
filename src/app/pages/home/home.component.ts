import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {
  RecipeSearchResultDisplayComponent
} from '../../components/recipe-search-result-display/recipe-search-result-display.component';
import {
  RecipeAdvancedSearchParamsComponent
} from '../../components/recipe-advanced-search-params/recipe-advanced-search-params.component';
import {
  RecipeMainSearchParamsComponent
} from '../../components/recipe-main-search-params/recipe-main-search-params.component';
import {RecipeService} from '../../services/recipe.service';
import {IngredientsService} from '../../services/ingredients.service';
import {LanguageService} from '../../services/language.service';
import {PageResponseRecipeSearchResponse, RecipeSearchResponse} from '../../services/responses';
import {forkJoin, of, switchMap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {PaginationComponent} from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-home',
  imports: [
    RecipeSearchResultDisplayComponent,
    RecipeAdvancedSearchParamsComponent,
    RecipeMainSearchParamsComponent,
    PaginationComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  recipes = signal<RecipeSearchResponse[] | undefined>(undefined);
  loading = signal(false);
  refreshingIngredientNames = signal(false);
  totalCount = signal(0);

  private recipeService = inject(RecipeService);
  private ingredientsService = inject(IngredientsService);
  private languageService = inject(LanguageService);

  get limit() {
    return this.recipeService.queryParams.limit;
  }

  constructor() {
    this.recipeService.queryParamsChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.search())

    effect(() => {
      const lang = this.languageService.selectedLanguage();
      if (!lang?.id) return;
      if (this.recipeService.queryParams.ingredientLanguageId === lang.id) return;
      this.recipeService.queryParams.ingredientLanguageId = lang.id;
      this.refreshIngredientNames(lang.id);
      this.search();
    });
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.languageService.getAll().pipe(
      switchMap(() => {
        this.recipeService.queryParams.ingredientLanguageId = this.languageService.selectedLanguage()!.id!;
        return this.recipeService.search();
      })
    ).subscribe({
      next: response => this.usePageResponse(response),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  search(): void {
    this.loading.set(true);
    this.recipeService.search().subscribe({
      next: response => this.usePageResponse(response),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }

  private refreshIngredientNames(languageId: number): void {
    const all = [
      ...this.recipeService.includedIngredients,
      ...this.recipeService.excludedIngredients,
    ];
    const ingredientChips = all.filter(u => u.ingredient !== undefined);
    const categoryChips = all.filter(u => u.category !== undefined);

    const ingredientIds = ingredientChips.map(u => u.ingredient!.ingredientId);
    const categoryIds = categoryChips.map(u => u.category!.id);

    if (ingredientIds.length === 0 && categoryIds.length === 0) return;

    this.refreshingIngredientNames.set(true);
    forkJoin({
      ingredients: ingredientIds.length > 0
        ? this.ingredientsService.findByIds(languageId, ingredientIds)
        : of([]),
      categories: categoryIds.length > 0
        ? this.ingredientsService.findCategoriesByIds(languageId, categoryIds)
        : of([]),
    }).subscribe(({ingredients, categories}) => {
      this.refreshingIngredientNames.set(false);

      const ingredientById = new Map(ingredients.map(r => [r.ingredientId, r]));
      for (const chip of ingredientChips) {
        const updated = ingredientById.get(chip.ingredient!.ingredientId);
        if (updated) {
          chip.ingredient!.name = updated.name;
          chip.ingredient!.alternatives = updated.alternatives;
        }
      }

      const categoryById = new Map(categories.map(c => [c.id, c]));
      for (const chip of categoryChips) {
        const updated = categoryById.get(chip.category!.id);
        if (updated) {
          chip.category!.name = updated.name;
          chip.category!.ingredientIds = updated.ingredientIds;
        }
      }
    });
  }

  private usePageResponse(response: PageResponseRecipeSearchResponse) {
    this.recipes.set(response.items ?? []);
    this.totalCount.set(response.totalCount ?? 0);
  }
}
