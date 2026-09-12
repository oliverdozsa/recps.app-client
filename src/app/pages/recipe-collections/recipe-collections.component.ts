import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthService} from '../../services/auth.service';
import {RecipeCollectionService} from '../../services/recipe-collection.service';
import {RecipeCollectionSimplifiedResponse} from '../../services/responses';

@Component({
  selector: 'app-recipe-collections',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './recipe-collections.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeCollectionsComponent implements OnInit {
  authService = inject(AuthService);
  private collectionService = inject(RecipeCollectionService);
  private router = inject(Router);

  collections = signal<RecipeCollectionSimplifiedResponse[]>([]);
  loading = signal(true);
  collectionToDelete = signal<RecipeCollectionSimplifiedResponse | null>(null);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.loading.set(false);
      return;
    }
    this.collectionService.getAll().subscribe({
      next: collections => {
        this.collections.set(collections);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  navigateToCreate() {
    this.router.navigate(['/recipe-collections/new']);
  }

  confirmDelete(collection: RecipeCollectionSimplifiedResponse) {
    this.collectionToDelete.set(collection);
  }

  cancelDelete() {
    this.collectionToDelete.set(null);
  }

  confirmDeleteConfirmed() {
    const collection = this.collectionToDelete();
    if (!collection) return;
    this.collectionService.delete(collection.id).subscribe(() => {
      this.collections.update(list => list.filter(c => c.id !== collection.id));
      this.collectionToDelete.set(null);
    });
  }
}
