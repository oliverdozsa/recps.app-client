import {Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output, signal} from '@angular/core';
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

  generate(): void {
    const collection = this.selectedCollection();
    if (!collection) return;
    this.generating.set(true);

    const requests = Array.from({length: this.numDays}, () =>
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
          this.generated.emit(results.map(r => {
            const randomIndex = Math.floor(Math.random() * r.items!.length);
            return r.items?.[randomIndex] ?? null;
          }));
        },
        error: () => {
          this.generating.set(false);
          this.closed.emit();
        }
      });
  }
}
