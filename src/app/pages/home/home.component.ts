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
import {RecipeSearchResponse} from '../../services/responses';
import {forkJoin} from 'rxjs';
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
  recipes = signal<RecipeSearchResponse[]>([]);
  loading = signal(false);

  private recipeService = inject(RecipeService);
  private languageService = inject(LanguageService);

  constructor() {
    this.recipeService.queryParamsChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.search())
  }

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin([
      this.recipeService.search(),
      this.languageService.getAll()
    ]).subscribe({
      next: ([recipesResponse]) => {
        this.recipes.set(recipesResponse.items ?? []);
      },
      complete: () => this.loading.set(false),
      error: error => this.loading.set(false),
    });
  }

  search(): void {
    this.loading.set(true);
    this.recipeService.search().subscribe({
      next: response => this.recipes.set(response.items ?? []),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }
}
