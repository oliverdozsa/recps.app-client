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
import {switchMap} from 'rxjs';
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
    const allIngredients = [
      ...this.recipeService.includedIngredients,
      ...this.recipeService.excludedIngredients,
    ];
    const ids = allIngredients.map(i => i.ingredientId);
    if (ids.length === 0) return;

    this.ingredientsService.findByIds(languageId, ids).subscribe(results => {
      const byId = new Map(results.map(r => [r.ingredientId, r]));
      for (const ingredient of allIngredients) {
        const updated = byId.get(ingredient.ingredientId);
        if (updated) {
          ingredient.name = updated.name;
          ingredient.alternatives = updated.alternatives;
        }
      }
    });
  }

  private usePageResponse(response: PageResponseRecipeSearchResponse) {
    this.recipes.set(response.items ?? []);
    this.totalCount.set(response.totalCount ?? 0);
  }
}
