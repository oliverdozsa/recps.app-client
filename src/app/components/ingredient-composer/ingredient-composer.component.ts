import {ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {TranslatePipe} from '@ngx-translate/core';
import {AddIngredientControlComponent} from './add-ingredient-control.component';
import {SearchStateService} from '../../services/search-state.service';
import {IngredientsService} from '../../services/ingredients.service';
import {LanguageService} from '../../services/language.service';
import {Chip} from '../../models/chip.model';

@Component({
  selector: 'app-ingredient-composer',
  standalone: true,
  imports: [AddIngredientControlComponent, TranslatePipe],
  templateUrl: './ingredient-composer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IngredientComposerComponent {
  state = inject(SearchStateService);
  private ingredientsService = inject(IngredientsService);
  private languageService = inject(LanguageService);
  private destroyRef = inject(DestroyRef);

  private ingredientNamesCache = signal<Map<string, string[]>>(new Map());
  private loadingKeys = signal<Set<string>>(new Set());
  dialogChip = signal<Chip | null>(null);

  includeKeys = computed(() => new Set(this.state.includeChips().map(c => c.key)));
  excludeKeys = computed(() => new Set(this.state.excludeChips().map(c => c.key)));
  conflicting = computed(() => this.state.conflictingIngredientIds());
  includeLanes = computed(() => this.state.includeLanes());
  canAddGroup = computed(() => {
    const lanes = this.includeLanes();
    return lanes[lanes.length - 1].chips.length > 0;
  });

  addGroup() {
    this.state.addIncludeLane();
  }

  addInclude(chip: Chip, laneIndex: number) {
    this.state.addIncludeChip(chip, laneIndex);
  }

  removeInclude(chip: Chip) {
    this.state.removeIncludeChip(chip);
  }

  addExclude(chip: Chip) {
    this.state.addExcludeChip(chip);
  }

  removeExclude(chip: Chip) {
    this.state.removeExcludeChip(chip);
  }

  toggleRelation(index: number) {
    this.state.toggleIncludeRelation(index);
  }

  removeLastInclude(laneIndex: number) {
    const lane = this.state.includeLanes()[laneIndex];
    if (lane && lane.chips.length > 0) this.state.removeIncludeChip(lane.chips[lane.chips.length - 1]);
  }

  removeLastExclude() {
    const chips = this.state.excludeChips();
    if (chips.length > 0) this.state.removeExcludeChip(chips[chips.length - 1]);
  }

  isConflicting(chip: Chip): boolean {
    return chip.ids.some(id => this.conflicting().has(id));
  }

  categoryIngredientNames(chip: Chip): string[] | undefined {
    return this.ingredientNamesCache().get(chip.key);
  }

  isLoadingIngredientNames(chip: Chip): boolean {
    return this.loadingKeys().has(chip.key);
  }

  openIngredientsDialog(chip: Chip) {
    if (!chip.isCategory) return;
    this.dialogChip.set(chip);
    this.ensureIngredientNamesLoaded(chip);
  }

  closeIngredientsDialog() {
    this.dialogChip.set(null);
  }

  private ensureIngredientNamesLoaded(chip: Chip) {
    if (this.ingredientNamesCache().has(chip.key) || this.loadingKeys().has(chip.key)) return;
    const languageId = this.languageService.selectedLanguage()?.id;
    if (!languageId || chip.ids.length === 0) return;

    this.loadingKeys.update(keys => new Set(keys).add(chip.key));
    this.ingredientsService.findByIds(languageId, chip.ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: names => {
          this.ingredientNamesCache.update(cache => new Map(cache).set(chip.key, names.map(n => n.name)));
          this.loadingKeys.update(keys => {
            const next = new Set(keys);
            next.delete(chip.key);
            return next;
          });
        },
        error: () => {
          this.loadingKeys.update(keys => {
            const next = new Set(keys);
            next.delete(chip.key);
            return next;
          });
        }
      });
  }
}
