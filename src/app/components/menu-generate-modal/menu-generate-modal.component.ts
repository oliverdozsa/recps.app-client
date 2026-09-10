import {ChangeDetectionStrategy, Component, inject, input, output, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {forkJoin, map} from 'rxjs';
import {RecipeCollectionService} from '../../services/recipe-collection.service';
import {SearchStateService} from '../../services/search-state.service';
import {RecipeCollectionSimplifiedResponse} from '../../services/responses';
import {Recipe} from '../../models/recipe.model';

@Component({
  selector: 'app-menu-generate-modal',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './menu-generate-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuGenerateModalComponent {
  private collectionService = inject(RecipeCollectionService);
  private searchState = inject(SearchStateService);

  numDays = input(1);
  closed = output<void>();
  generated = output<(Recipe | null)[]>();

  collections = signal<RecipeCollectionSimplifiedResponse[]>([]);
  loading = signal(true);
  generating = signal(false);
  selectedCollection = signal<RecipeCollectionSimplifiedResponse | null>(null);
  selectedDayIndices = signal<Set<number>>(new Set());

  constructor() {
    this.collectionService.getAll().subscribe({
      next: cs => {
        this.collections.set(cs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  canGenerate(): boolean {
    return this.selectedCollection() !== null && !this.loading() && this.selectedDayIndices().size > 0;
  }

  selectCollection(c: RecipeCollectionSimplifiedResponse) {
    this.selectedCollection.set(c);
  }

  toggleDay(index: number) {
    this.selectedDayIndices.update(set => {
      const next = new Set(set);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  }

  toggleAllDays() {
    if (this.selectedDayIndices().size === this.numDays()) {
      this.selectedDayIndices.set(new Set());
    } else {
      this.selectedDayIndices.set(new Set(Array.from({length: this.numDays()}, (_, i) => i)));
    }
  }

  generate() {
    const collection = this.selectedCollection();
    if (!collection) return;

    this.generating.set(true);

    forkJoin(
      Array.from(this.selectedDayIndices()).map(() =>
        this.randomRecipeFrom(collection.id)
      )
    ).subscribe({
      next: recipes => {
        const dayIndices = Array.from(this.selectedDayIndices());
        const result: (Recipe | null)[] = Array.from({length: this.numDays()}, () => null);
        dayIndices.forEach((dayIndex, i) => {
          result[dayIndex] = recipes[i];
        });
        this.generating.set(false);
        this.generated.emit(result);
      },
      error: () => {
        this.generating.set(false);
        this.closed.emit();
      }
    });
  }

  private randomRecipeFrom(collectionId: number) {
    return this.searchState.searchRandomPage({collections: [collectionId], limit: 15}).pipe(
      map(page => {
        const items = page.items ?? [];
        return items.length > 0 ? items[Math.floor(Math.random() * items.length)] : null;
      })
    );
  }
}
