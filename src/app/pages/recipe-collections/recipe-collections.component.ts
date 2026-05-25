import {Component, inject, OnInit, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {RecipeCollectionService} from '../../services/recipe-collection.service';
import {AuthService} from '../../services/auth.service';
import {RecipeCollectionSimplifiedResponse} from '../../services/responses';
import {CollectionInputComponent} from '../../components/collection-input/collection-input.component';

@Component({
  selector: 'app-recipe-collections',
  imports: [RouterLink, TranslatePipe, CollectionInputComponent],
  templateUrl: './recipe-collections.component.html',
  styleUrl: './recipe-collections.component.css'
})
export class RecipeCollectionsComponent implements OnInit {
  collections = signal<RecipeCollectionSimplifiedResponse[]>([]);
  loading = signal(false);
  collectionToDelete: RecipeCollectionSimplifiedResponse | null = null;

  private collectionService = inject(RecipeCollectionService);
  protected authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn) return;
    this.loading.set(true);
    this.collectionService.getAll().subscribe({
      next: collections => this.collections.set(collections),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/recipe-collections/new']);
  }

  confirmDelete(collection: RecipeCollectionSimplifiedResponse): void {
    this.collectionToDelete = collection;
  }

  confirmDeleteConfirmed(): void {
    if (!this.collectionToDelete) return;
    const id = this.collectionToDelete.id;
    this.collectionToDelete = null;
    this.loading.set(true);
    this.collectionService.delete(id).subscribe({
      next: () => this.collections.update(cs => cs.filter(c => c.id !== id)),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }
}
