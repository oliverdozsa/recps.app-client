import {Component, inject, OnInit, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MenuService} from '../../services/menu.service';
import {AuthService} from '../../services/auth.service';
import {MenuPlanSimplifiedResponse} from '../../services/responses';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageService} from '../../services/language.service';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  menus = signal<MenuPlanSimplifiedResponse[]>([]);
  loading = signal(false);
  menuToDelete: MenuPlanSimplifiedResponse | null = null;

  private menuService = inject(MenuService);
  protected authService = inject(AuthService);
  protected languageService = inject(LanguageService);
  private router = inject(Router);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn) return;

    this.loading.set(true);
    this.languageService.getAllIfNeeded();
    this.menuService.getAll().subscribe({
      next: menus => this.menus.set(menus),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/menu/new']);
  }

  confirmDelete(menu: MenuPlanSimplifiedResponse): void {
    this.menuToDelete = menu;
  }

  confirmDeleteConfirmed(): void {
    if (!this.menuToDelete) return;
    const id = this.menuToDelete.id;
    this.menuToDelete = null;
    this.loading.set(true);
    this.menuService.delete(id).subscribe({
      next: () => this.menus.update(menus => menus.filter(m => m.id !== id)),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }
}
