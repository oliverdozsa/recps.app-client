import {Component, computed, inject, input, output, signal} from '@angular/core';
import {RecipeService} from '../../services/recipe.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {
  private recipeService = inject(RecipeService);

  pageSize = input.required<number>();
  totalCount = input.required<number>();

  pageChanged = output<number>();

  currentPage = signal(1);

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);

    const pages: number[] = [1];
    if (current > 3) pages.push(-1);
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
      pages.push(p);
    }
    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });

  constructor() {
    this.recipeService.pageReset$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.reset());

    const restoredPage = this.recipeService.queryParams.page ?? 0;
    this.currentPage.set(restoredPage + 1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
    this.recipeService.queryParams.page = this.currentPage() - 1;
    this.recipeService.queryParamsChanged$.next();
  }

  reset(): void {
    this.currentPage.set(1);
  }
}
