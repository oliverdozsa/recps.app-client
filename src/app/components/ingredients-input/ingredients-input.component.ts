import {Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {TagsInputComponent} from '../tags-input/tags-input.component';
import {IngredientsService} from '../../services/ingredients.service';
import {LanguageService} from '../../services/language.service';
import {Subject, debounceTime, switchMap, EMPTY} from 'rxjs';
import {IngredientSearchResponse} from '../../services/responses';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RecipeService} from '../../services/recipe.service';
import {Ingredient} from '../../services/common.data';

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
  @Output() selectedIngredientsChange = new EventEmitter<IngredientSearchResponse[]>();

  options: IngredientSearchResponse[] = [];
  isSearching = false;

  private query$ = new Subject<string>();
  private destroyRef = inject(DestroyRef);
  private currentIngredients: IngredientSearchResponse[] = [];

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

  ngOnInit(): void {
    this.query$.pipe(
      debounceTime(300),
      switchMap(query => {
        if (query.length < 2) {
          this.options = [];
          return EMPTY;
        }
        const langId = this.languageService.selectedLanguage()?.id;
        if (!langId) return EMPTY;
        this.isSearching = true;
        return this.ingredientsService.search(langId, query);
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

  display(ingredient: IngredientSearchResponse): string {
    return ingredient.name!;
  }

  onIngredientsChange(ingredients: IngredientSearchResponse[]): void {
    this.selectedIngredientsChange.emit(ingredients);
    this.currentIngredients = ingredients;
  }

  private findIngredientNameById(id: number) {
    const ingredient = this.currentIngredients.find(i => i.ingredientId == id);
    if (ingredient) {
      return ingredient.name;
    } else {
      return undefined;
    }
  }
}
