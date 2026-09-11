import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {AddIngredientControlComponent} from './add-ingredient-control.component';
import {SearchStateService} from '../../services/search-state.service';
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

  includeKeys = computed(() => new Set(this.state.includeChips().map(c => c.key)));
  excludeKeys = computed(() => new Set(this.state.excludeChips().map(c => c.key)));
  conflicting = computed(() => this.state.conflictingIngredientIds());
  includeLanes = computed(() => this.state.includeLanes());
  /** Whether a group has actually been started (i.e. addGroup() was used), independent of whether the new lane has chips yet. */
  isGrouped = computed(() => this.includeLanes().length > 1);
  canAddGroup = computed(() => {
    const lanes = this.includeLanes();
    return lanes[lanes.length - 1].chips.length > 0;
  });

  addGroup() {
    this.state.addIncludeLane();
  }

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

  toggleRelation(index: number) {
    this.state.toggleIncludeRelation(index);
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
