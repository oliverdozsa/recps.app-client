import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {AddIngredientControlComponent} from './add-ingredient-control.component';
import {SearchStateService} from '../../services/search-state.service';
import {Chip} from '../../models/chip.model';

@Component({
  selector: 'app-ingredient-composer',
  standalone: true,
  imports: [AddIngredientControlComponent],
  templateUrl: './ingredient-composer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IngredientComposerComponent {
  state = inject(SearchStateService);

  includeKeys = computed(() => new Set(this.state.includeChips().map(c => c.key)));
  excludeKeys = computed(() => new Set(this.state.excludeChips().map(c => c.key)));
  conflicting = computed(() => this.state.conflictingIngredientIds());

  addInclude(chip: Chip) {
    this.state.addIncludeChip(chip);
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

  removeLastInclude() {
    const chips = this.state.includeChips();
    if (chips.length > 0) this.state.removeIncludeChip(chips[chips.length - 1]);
  }

  removeLastExclude() {
    const chips = this.state.excludeChips();
    if (chips.length > 0) this.state.removeExcludeChip(chips[chips.length - 1]);
  }

  isConflicting(chip: Chip): boolean {
    return chip.ids.some(id => this.conflicting().has(id));
  }
}
