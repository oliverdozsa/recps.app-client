import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthService} from '../../services/auth.service';
import {MenuService} from '../../services/menu.service';
import {MenuPlanSimplifiedResponse} from '../../services/responses';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit {
  authService = inject(AuthService);
  private menuService = inject(MenuService);
  private router = inject(Router);

  menus = signal<MenuPlanSimplifiedResponse[]>([]);
  loading = signal(true);
  menuToDelete = signal<MenuPlanSimplifiedResponse | null>(null);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.loading.set(false);
      return;
    }
    this.menuService.getAll().subscribe({
      next: menus => {
        this.menus.set(menus);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  navigateToCreate() {
    this.router.navigate(['/menu/new']);
  }

  confirmDelete(menu: MenuPlanSimplifiedResponse) {
    this.menuToDelete.set(menu);
  }

  cancelDelete() {
    this.menuToDelete.set(null);
  }

  confirmDeleteConfirmed() {
    const menu = this.menuToDelete();
    if (!menu) return;
    this.menuService.delete(menu.id).subscribe(() => {
      this.menus.update(list => list.filter(m => m.id !== menu.id));
      this.menuToDelete.set(null);
    });
  }
}
