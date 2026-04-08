import {Component, inject, OnInit, signal} from '@angular/core';
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
import {LanguageService} from '../../services/language.service';
import {IngredientSearchResponse, RecipeSearchResponse} from '../../services/responses';
import {debounceTime, forkJoin, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  imports: [
    RecipeSearchResultDisplayComponent,
    RecipeAdvancedSearchParamsComponent,
    RecipeMainSearchParamsComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  filterByName = signal('');
  includedIngredients = signal<IngredientSearchResponse[]>([]);
  excludedIngredients = signal<IngredientSearchResponse[]>([]);
  recipes = signal<RecipeSearchResponse[]>([]);
  loading = signal(false);

  private recipeService = inject(RecipeService);
  private languageService = inject(LanguageService);
  private filterByNameChange$ = new Subject<string>();

  constructor() {
    this.filterByNameChange$.pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe(filterByName => {
        if (filterByName.length >= 2 || filterByName.length == 0) {
          this.filterByName.set(filterByName);
          this.search()
        }
      })
  }

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin([
      this.recipeService.search({}),
      this.languageService.getAll()
    ]).subscribe({
      next: ([recipesResponse]) => {
        this.recipes.set(recipesResponse.items ?? []);
      },
      complete: () => this.loading.set(false)
    });
  }

  search(): void {
    this.loading.set(true);
    this.recipeService.search(this.buildSearchRequest()).subscribe({
      next: response => this.recipes.set(response.items ?? []),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }

  filterByNameChange(value: string) {
    this.filterByNameChange$.next(value);
  }

  private buildSearchRequest() {
    const included = this.includedIngredients();
    const excluded = this.excludedIngredients();
    const minMatch = this.includedIngredients().length;

    return {
      filterByName: this.filterByName(),
      includedIngredientGroups: included.length > 0
        ? [{ group: { ids: included.map(i => i.ingredientId!), minMatch: minMatch }, relation: 'OR' as const }]
        : undefined,
      excludedIngredients: excluded.length > 0
        ? excluded.map(i => i.ingredientId!)
        : undefined
    };
  }
}
