import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {RecipeCollectionService} from '../../../services/recipe-collection.service';
import {AuthService} from '../../../services/auth.service';
import {LanguageService} from '../../../services/language.service';
import {MarkedRecipesService} from '../../../services/marked-recipes.service';
import {RecipeCollectionDetailedResponse, RecipeSearchResponse} from '../../../services/responses';
import {RecipeCompactCardComponent} from '../../../components/recipe-compact-card/recipe-compact-card.component';

@Component({
  selector: 'app-view-edit-recipe-collection',
  imports: [TranslatePipe, RecipeCompactCardComponent, FormsModule],
  templateUrl: './view-edit-recipe-collection.component.html',
  styleUrl: './view-edit-recipe-collection.component.css'
})
export class ViewEditRecipeCollectionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private collectionService = inject(RecipeCollectionService);
  protected authService = inject(AuthService);
  private languageService = inject(LanguageService);
  protected markedRecipesService = inject(MarkedRecipesService);

  loading = signal(false);
  saving = signal(false);
  collection = signal<RecipeCollectionDetailedResponse | null>(null);
  isEditing = signal(false);
  collectionToDelete: RecipeCollectionDetailedResponse | null = null;

  editName = '';
  editRecipes: RecipeSearchResponse[] = [];

  ngOnInit(): void {
    if (!this.authService.isLoggedIn) return;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.collectionService.getById(id, this.languageService.selectedLanguage()?.id).subscribe({
      next: c => this.collection.set(c),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  startEdit(): void {
    const c = this.collection();
    if (!c) return;
    this.editName = c.name ?? '';
    this.editRecipes = [...(c.recipes ?? [])];
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  removeRecipe(recipe: RecipeSearchResponse): void {
    this.editRecipes = this.editRecipes.filter(r => r.id !== recipe.id);
  }

  addMarkedRecipes(): void {
    const marked = this.markedRecipesService.markedRecipes();
    const existingIds = new Set(this.editRecipes.map(r => r.id));
    const toAdd = marked.filter(r => !existingIds.has(r.id));
    this.editRecipes = [...this.editRecipes, ...toAdd];
  }

  get canAddMarked(): boolean {
    const marked = this.markedRecipesService.markedRecipes();
    const existingIds = new Set(this.editRecipes.map(r => r.id));
    return marked.some(r => !existingIds.has(r.id));
  }

  get canSave(): boolean {
    return this.editName.trim().length >= 2;
  }

  save(): void {
    if (!this.canSave) return;
    const id = this.collection()?.id;
    if (!id) return;
    this.saving.set(true);
    const recipeIds = this.editRecipes.map(r => r.id!);
    this.collectionService.update(id, {name: this.editName.trim(), recipeIds}).subscribe({
      next: () => {
        this.collection.update(c => c ? {...c, name: this.editName.trim(), recipes: this.editRecipes} : c);
        this.isEditing.set(false);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  confirmDelete(collection: RecipeCollectionDetailedResponse): void {
    this.collectionToDelete = collection;
  }

  confirmDeleteConfirmed(): void {
    if (!this.collectionToDelete?.id) return;
    const id = this.collectionToDelete.id;
    this.collectionToDelete = null;
    this.loading.set(true);
    this.collectionService.delete(id).subscribe({
      next: () => this.router.navigate(['/recipe-collections']),
      error: () => this.loading.set(false),
    });
  }
}
