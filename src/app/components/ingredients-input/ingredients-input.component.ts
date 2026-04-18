import {Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {TagsInputComponent} from '../tags-input/tags-input.component';
import {IngredientsService, SearchSource} from '../../services/ingredients.service';
import {LanguageService} from '../../services/language.service';
import {BehaviorSubject, combineLatest, Subject, debounceTime, switchMap, EMPTY} from 'rxjs';
import {IngredientSearchAndCategoryUnion, unionIds, unionName} from '../../services/responses';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RecipeService} from '../../services/recipe.service';

@Component({
  selector: 'app-ingredients-input',
  imports: [TagsInputComponent],
  templateUrl: './ingredients-input.component.html',
  styleUrl: './ingredients-input.component.css'
})
export class IngredientsInputComponent implements OnInit {
  private ingredientsService = inject(IngredientsService);
  private languageService = inject(LanguageService);
  private recipeService = inject(RecipeService);

  @Input() badgeClass = "badge-primary";
  @Input() initialIngredients: IngredientSearchAndCategoryUnion[] = [];
  @Input() enableCategories = true;
  @Output() selectedIngredientsChange = new EventEmitter<IngredientSearchAndCategoryUnion[]>();

  options: IngredientSearchAndCategoryUnion[] = [];
  isSearching = false;

  private query$ = new Subject<string>();
  private source$ = new BehaviorSubject<SearchSource>(SearchSource.Ingredients);
  private destroyRef = inject(DestroyRef);
  private currentIngredients: IngredientSearchAndCategoryUnion[] = [];

  get conflictingIngredientNames(): string[] {
    const result: string[] = [];
    this.recipeService.conflictingIngredients.forEach(id => {
      const name = this.findIngredientNameById(id);
      if (name) {
        result.push(name);
      }
    });

    return result;
  }

  get selectOptionsForSearchSource() {
    if (this.enableCategories) {
      return [
        {value: SearchSource.Ingredients, displayName: "Search in ingredients"},
        {value: SearchSource.Categories, displayName: "Search in categories"}
      ]
    }

    return [];
  }

  ngOnInit(): void {
    if (this.initialIngredients.length > 0) {
      this.currentIngredients = [...this.initialIngredients];
    }

    combineLatest([
      this.query$.pipe(debounceTime(300)),
      this.source$
    ]).pipe(
      switchMap(([query, source]) => {
        if (query.length < 2) {
          this.options = [];
          return EMPTY;
        }
        const langId = this.languageService.selectedLanguage()?.id;
        if (!langId) return EMPTY;
        this.isSearching = true;
        return this.ingredientsService.searchUnified(langId, query, source);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(results => {
      this.options = results;
      this.isSearching = false;
    });
  }

  onQueryChange(query: string): void {
    this.query$.next(query);
  }

  display(item: IngredientSearchAndCategoryUnion): string {
    return unionName(item);
  }

  onIngredientsChange(ingredients: IngredientSearchAndCategoryUnion[]): void {
    this.selectedIngredientsChange.emit(ingredients);
    this.currentIngredients = ingredients;
  }

  onSelectChange(value: SearchSource) {
    this.source$.next(value);
  }

  private findIngredientNameById(id: number): string | undefined {
    for (const item of this.currentIngredients) {
      if (unionIds(item).includes(id)) {
        return unionName(item);
      }
    }
    return undefined;
  }
}
