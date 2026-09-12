import {ChangeDetectionStrategy, Component, computed, inject, input, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {MarkedRecipesService} from '../../services/marked-recipes.service';
import {Recipe} from '../../models/recipe.model';

interface DisplayTag {
  id: number;
  label: string;
  matched: boolean;
}

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './recipe-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeCardComponent {
  private markedRecipesService = inject(MarkedRecipesService);

  recipe = input.required<Recipe>();
  matchedIngredientIds = input<Set<number>>(new Set());
  languageIso = input<string>('hu');

  expanded = signal(false);

  isMarked = computed(() => this.markedRecipesService.markedRecipes().some(r => r.id === this.recipe().id));

  toggleMarked(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.markedRecipesService.toggle(this.recipe());
  }

  private allTags = computed<DisplayTag[]>(() => {
    const matched = this.matchedIngredientIds();
    const iso = this.languageIso();
    const tags = (this.recipe().ingredients ?? []).map(ing => ({
      id: ing.id,
      label: ing.names?.find(n => n.languageIso === iso)?.name ?? ing.names?.[0]?.name ?? '',
      matched: matched.has(ing.id)
    }));
    return tags.sort((a, b) => Number(b.matched) - Number(a.matched));
  });

  visibleTags = computed(() => {
    if (this.expanded()) return this.allTags();
    return this.allTags().slice(0, 3);
  });

  hiddenCount = computed(() => Math.max(0, this.allTags().length - 3));

  toggleExpanded(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.expanded.update(v => !v);
  }
}
