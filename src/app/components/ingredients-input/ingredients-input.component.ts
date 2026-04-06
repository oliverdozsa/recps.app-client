import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {TagsInputComponent} from '../tags-input/tags-input.component';
import {IngredientsService} from '../../services/ingredients.service';
import {LanguageService} from '../../services/language.service';
import {Subject, debounceTime, switchMap, EMPTY} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {IngredientSearchResponse} from '../../services/responses';

@Component({
  selector: 'app-ingredients-input',
  imports: [TagsInputComponent],
  templateUrl: './ingredients-input.component.html',
  styleUrl: './ingredients-input.component.css'
})
export class IngredientsInputComponent implements OnInit, OnDestroy {
  private ingredientsService = inject(IngredientsService);
  private languageService = inject(LanguageService);

  options: IngredientSearchResponse[] = [];

  private query$ = new Subject<string>();
  private destroy$ = new Subject<void>();

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
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.options = results;
    });
  }

  onQueryChange(query: string): void {
    this.query$.next(query);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  display(ingredient: IngredientSearchResponse): string {
    return ingredient.name!;
  }
}
