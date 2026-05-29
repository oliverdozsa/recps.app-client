import {Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {TagsInputComponent} from '../tags-input/tags-input.component';
import {RecipeCollectionService} from '../../services/recipe-collection.service';
import {RecipeCollectionSimplifiedResponse} from '../../services/responses';

@Component({
  selector: 'app-collection-input',
  imports: [TagsInputComponent],
  templateUrl: './collection-input.component.html',
})
export class CollectionInputComponent implements OnInit {
  private collectionService = inject(RecipeCollectionService);
  private destroyRef = inject(DestroyRef);

  @Input() badgeClass = 'badge-primary';
  @Input() initialCollections: RecipeCollectionSimplifiedResponse[] = [];
  @Output() selectedCollectionsChange = new EventEmitter<RecipeCollectionSimplifiedResponse[]>();

  filteredOptions: RecipeCollectionSimplifiedResponse[] = [];
  isLoading = false;

  private allCollections: RecipeCollectionSimplifiedResponse[] = [];
  private currentQuery = '';

  ngOnInit(): void {
    this.isLoading = true;

    this.collectionService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(collections => {
        this.allCollections = collections;
        this.isLoading = false;
        this.applyFilter();
      });
  }

  display(collection: RecipeCollectionSimplifiedResponse): string {
    return collection.name;
  }

  onQueryChange(query: string): void {
    this.currentQuery = query;
    this.applyFilter();
  }

  onCollectionsChange(collections: RecipeCollectionSimplifiedResponse[]): void {
    this.selectedCollectionsChange.emit(collections);
    this.applyFilter();
  }

  private applyFilter(): void {
    const lower = this.currentQuery.toLowerCase().trim();
    this.filteredOptions = lower
      ? this.allCollections.filter(c => c.name.toLowerCase().includes(lower))
      : this.allCollections;
  }
}
