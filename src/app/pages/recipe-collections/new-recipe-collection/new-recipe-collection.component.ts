import {Component, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthService} from '../../../services/auth.service';
import {MarkedRecipesService} from '../../../services/marked-recipes.service';
import {RecipeCollectionService} from '../../../services/recipe-collection.service';
import {MarkedRecipesComponent} from '../../../components/marked-recipes/marked-recipes.component';

@Component({
  selector: 'app-new-recipe-collection',
  imports: [MarkedRecipesComponent, TranslatePipe, FormsModule],
  templateUrl: './new-recipe-collection.component.html',
  styleUrl: './new-recipe-collection.component.css'
})
export class NewRecipeCollectionComponent {
  protected authService = inject(AuthService);
  protected markedRecipesService = inject(MarkedRecipesService);
  private collectionService = inject(RecipeCollectionService);
  private router = inject(Router);

  name = '';
  saving = signal(false);

  get canSave(): boolean {
    return this.name.trim().length >= 2 && this.markedRecipesService.markedRecipes().length > 0;
  }

  save(): void {
    if (!this.canSave) return;
    this.saving.set(true);
    const recipeIds = this.markedRecipesService.markedRecipes().map(r => r.id!);
    this.collectionService.create({name: this.name.trim(), recipeIds}).subscribe({
      next: () => this.router.navigate(['/recipe-collections']),
      error: () => this.saving.set(false),
    });
  }
}
