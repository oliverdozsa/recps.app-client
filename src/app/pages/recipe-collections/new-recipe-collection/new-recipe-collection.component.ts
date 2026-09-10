import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {RecipeCollectionService} from '../../../services/recipe-collection.service';
import {MarkedRecipesService} from '../../../services/marked-recipes.service';
import {MarkedRecipesComponent} from '../../../components/marked-recipes/marked-recipes.component';

@Component({
  selector: 'app-new-recipe-collection',
  standalone: true,
  imports: [FormsModule, TranslatePipe, MarkedRecipesComponent],
  templateUrl: './new-recipe-collection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewRecipeCollectionComponent {
  private collectionService = inject(RecipeCollectionService);
  markedRecipesService = inject(MarkedRecipesService);
  private router = inject(Router);

  name = signal('');
  saving = signal(false);

  canSave = computed(() => this.name().trim().length >= 2 && this.markedRecipesService.markedRecipes().length > 0);

  save() {
    if (!this.canSave()) return;
    this.saving.set(true);
    const recipeIds = this.markedRecipesService.markedRecipes().map(r => r.id!);
    this.collectionService.create({name: this.name().trim(), recipeIds}).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/recipe-collections']);
      },
      error: () => this.saving.set(false)
    });
  }
}
