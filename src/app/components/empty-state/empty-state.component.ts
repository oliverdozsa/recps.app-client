import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {Chip} from '../../models/chip.model';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  excludeChips = input<Chip[]>([]);
  removeExclude = output<Chip>();
  clearFilters = output<void>();
}
