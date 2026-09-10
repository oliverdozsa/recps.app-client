import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  page = input.required<number>();
  totalPages = input.required<number>();
  pageChange = output<number>();

  private windowSize = 5;

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= this.windowSize) {
      return Array.from({length: total}, (_, i) => i);
    }
    let start = Math.max(0, current - Math.floor(this.windowSize / 2));
    const end = Math.min(total, start + this.windowSize);
    start = Math.max(0, end - this.windowSize);
    return Array.from({length: end - start}, (_, i) => start + i);
  });

  goTo(p: number) {
    if (p < 0 || p >= this.totalPages() || p === this.page()) return;
    this.pageChange.emit(p);
  }

  prev() {
    this.goTo(this.page() - 1);
  }

  next() {
    this.goTo(this.page() + 1);
  }
}
