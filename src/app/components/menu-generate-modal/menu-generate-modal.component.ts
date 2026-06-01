import {Component, computed, DestroyRef, EventEmitter, inject, Input, OnInit, Output, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {forkJoin} from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import {RecipeCollectionService} from '../../services/recipe-collection.service';
import {RecipeService} from '../../services/recipe.service';
import {RecipeCollectionSimplifiedResponse, RecipeSearchResponse} from '../../services/responses';

@Component({
  selector: 'app-menu-generate-modal',
  imports: [TranslatePipe],
  templateUrl: './menu-generate-modal.component.html',
})
export class MenuGenerateModalComponent implements OnInit {
  @Input() numDays = 1;
  @Output() closed = new EventEmitter<void>();
  @Output() generated = new EventEmitter<(RecipeSearchResponse | null)[]>();

  private collectionService = inject(RecipeCollectionService);
  private recipeService = inject(RecipeService);
  private destroyRef = inject(DestroyRef);

  collections = signal<RecipeCollectionSimplifiedResponse[]>([]);
  selectedCollection = signal<RecipeCollectionSimplifiedResponse | null>(null);
  loading = signal(true);
  generating = signal(false);
  selectedDayIndices = signal<Set<number>>(new Set());

  dayIndices = computed(() => Array.from({length: this.numDays}, (_, i) => i));
  allDaysSelected = computed(() => this.selectedDayIndices().size === this.numDays);
  canGenerate = computed(() =>
    this.selectedCollection() !== null && !this.loading() && this.selectedDayIndices().size > 0
  );

  ngOnInit(): void {
    this.collectionService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(collections => {
        this.collections.set(collections);
        this.loading.set(false);
      });
  }

  selectCollection(collection: RecipeCollectionSimplifiedResponse): void {
    this.selectedCollection.set(collection);
  }

  toggleDay(index: number): void {
    this.selectedDayIndices.update(set => {
      const next = new Set(set);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  toggleAllDays(): void {
    if (this.allDaysSelected()) {
      this.selectedDayIndices.set(new Set());
    } else {
      this.selectedDayIndices.set(new Set(this.dayIndices()));
    }
  }

  generate(): void {
    const collection = this.selectedCollection();
    if (!collection || this.selectedDayIndices().size === 0) return;
    this.generating.set(true);

    const selectedArr = Array.from(this.selectedDayIndices());
    const requests = selectedArr.map(() =>
      this.recipeService.searchRandomPage({
        collections: [collection.id],
        limit: 15,
        ingredientLanguageId: 0
      })
    );

    forkJoin(requests)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: results => {
          this.generating.set(false);
          const output: (RecipeSearchResponse | null)[] = Array(this.numDays).fill(null);
          selectedArr.forEach((dayIdx, i) => {
            const r = results[i];
            const randomIndex = Math.floor(Math.random() * r.items!.length);
            output[dayIdx] = r.items?.[randomIndex] ?? null;
          });
          this.generated.emit(output);
        },
        error: () => {
          this.generating.set(false);
          this.closed.emit();
        }
      });
  }
}
