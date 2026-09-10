import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {RecipeCollectionService} from '../../../services/recipe-collection.service';
import {LanguageService} from '../../../services/language.service';
import {MarkedRecipesService} from '../../../services/marked-recipes.service';
import {RecipeCollectionDetailedResponse} from '../../../services/responses';
import {Recipe} from '../../../models/recipe.model';
import {MarkedRecipesComponent} from '../../../components/marked-recipes/marked-recipes.component';
import {RecipeCompactCardComponent} from '../../../components/recipe-compact-card/recipe-compact-card.component';

@Component({
  selector: 'app-view-edit-recipe-collection',
  standalone: true,
  imports: [FormsModule, TranslatePipe, MarkedRecipesComponent, RecipeCompactCardComponent],
  templateUrl: './view-edit-recipe-collection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewEditRecipeCollectionComponent implements OnInit {
  private collectionService = inject(RecipeCollectionService);
  private languageService = inject(LanguageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  markedRecipesService = inject(MarkedRecipesService);

  collection = signal<RecipeCollectionDetailedResponse | null>(null);
  loading = signal(true);
  isEditMode = signal(false);
  editName = signal('');
  editRecipes = signal<Recipe[]>([]);
  saving = signal(false);
  deleting = signal(false);

  canAddMarked = computed(() => {
    const existingIds = new Set(this.editRecipes().map(r => r.id));
    return this.markedRecipesService.markedRecipes().some(r => !existingIds.has(r.id));
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.collectionService.getById(id, this.languageService.selectedLanguage()?.id).subscribe({
      next: c => {
        this.collection.set(c);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  startEdit() {
    const c = this.collection();
    if (!c) return;
    this.editName.set(c.name ?? '');
    this.editRecipes.set([...(c.recipes ?? [])]);
    this.isEditMode.set(true);
  }

  cancelEdit() {
    this.isEditMode.set(false);
  }

  addMarkedRecipes() {
    const existingIds = new Set(this.editRecipes().map(r => r.id));
    const toAdd = this.markedRecipesService.markedRecipes().filter(r => !existingIds.has(r.id));
    this.editRecipes.update(recipes => [...recipes, ...toAdd]);
  }

  addRecipeToCollection(recipe: Recipe) {
    this.editRecipes.update(recipes => recipes.some(r => r.id === recipe.id) ? recipes : [...recipes, recipe]);
    this.markedRecipesService.remove(recipe);
  }

  removeRecipe(recipe: Recipe) {
    this.editRecipes.update(recipes => recipes.filter(r => r.id !== recipe.id));
  }

  moveBackToPool(recipe: Recipe) {
    this.removeRecipe(recipe);
    this.markedRecipesService.mark(recipe);
  }

  save() {
    const c = this.collection();
    if (!c?.id) return;
    this.saving.set(true);
    const recipeIds = this.editRecipes().map(r => r.id!);
    this.collectionService.update(c.id, {name: this.editName().trim(), recipeIds}).subscribe({
      next: () => {
        this.collection.update(current => current ? {...current, name: this.editName().trim(), recipes: this.editRecipes()} : current);
        this.saving.set(false);
        this.isEditMode.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  confirmDelete() {
    this.deleting.set(true);
  }

  cancelDelete() {
    this.deleting.set(false);
  }

  deleteConfirmed() {
    const c = this.collection();
    if (!c?.id) return;
    this.collectionService.delete(c.id).subscribe(() => this.router.navigate(['/recipe-collections']));
  }
}
