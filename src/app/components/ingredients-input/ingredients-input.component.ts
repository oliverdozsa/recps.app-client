import {Component, DestroyRef, EventEmitter, inject, OnInit, Output} from '@angular/core';
import {TagsInputComponent} from '../tags-input/tags-input.component';
import {IngredientsService} from '../../services/ingredients.service';
import {LanguageService} from '../../services/language.service';
import {Subject, debounceTime, switchMap, EMPTY} from 'rxjs';
import {IngredientSearchResponse as Ingredient} from '../../services/responses';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-ingredients-input',
  imports: [TagsInputComponent],
  templateUrl: './ingredients-input.component.html',
  styleUrl: './ingredients-input.component.css'
})
export class IngredientsInputComponent implements OnInit {
  private ingredientsService = inject(IngredientsService);
  private languageService = inject(LanguageService);

  @Output() selectedIngredientsChange = new EventEmitter<Ingredient[]>();

  options: Ingredient[] = [];

  private query$ = new Subject<string>();
  private destroyRef = inject(DestroyRef);

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
        return this.ingredientsService.search(langId, query);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(results => {
      this.options = results;
    });
  }

  onQueryChange(query: string): void {
    this.query$.next(query);
  }

  display(ingredient: Ingredient): string {
    return ingredient.name!;
  }
}
