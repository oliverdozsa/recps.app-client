import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {Chip} from '../../models/chip.model';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './empty-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  excludeChips = input<Chip[]>([]);
  removeExclude = output<Chip>();
  clearFilters = output<void>();
}
