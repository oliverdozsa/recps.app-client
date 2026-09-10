import {ChangeDetectionStrategy, Component, computed, inject, input, output, signal} from '@angular/core';
import {RecipeCollectionService} from '../../services/recipe-collection.service';
import {RecipeCollectionSimplifiedResponse} from '../../services/responses';
import {TagsInputComponent} from '../tags-input/tags-input.component';

@Component({
  selector: 'app-collection-input',
  standalone: true,
  imports: [TagsInputComponent],
  templateUrl: './collection-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionInputComponent {
  private collectionService = inject(RecipeCollectionService);

  initialCollections = input<RecipeCollectionSimplifiedResponse[]>([]);
  selectedCollectionsChange = output<RecipeCollectionSimplifiedResponse[]>();

  allCollections = signal<RecipeCollectionSimplifiedResponse[]>([]);
  query = signal('');

  filteredOptions = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return this.allCollections();
    return this.allCollections().filter(c => c.name.toLowerCase().includes(q));
  });

  displayFn = (c: RecipeCollectionSimplifiedResponse) => c.name;

  constructor() {
    this.collectionService.getAll().subscribe(collections => this.allCollections.set(collections));
  }

  onQueryChange(query: string) {
    this.query.set(query);
  }
}
