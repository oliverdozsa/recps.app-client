import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MenuService} from '../../../services/menu.service';
import {AuthService} from '../../../services/auth.service';
import {LanguageService} from '../../../services/language.service';
import {MenuPlanDetailedResponse} from '../../../services/responses';
import {MenuViewerEditorComponent} from '../../../components/menu-viewer-editor/menu-viewer-editor.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-view-edit-menu',
  imports: [MenuViewerEditorComponent, TranslatePipe],
  templateUrl: './view-edit-menu.component.html',
  styleUrl: './view-edit-menu.component.css'
})
export class ViewEditMenuComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private menuService = inject(MenuService);
  protected authService = inject(AuthService);
  private languageService = inject(LanguageService);

  loading = signal(false);
  menu = signal<MenuPlanDetailedResponse | null>(null);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn) return;

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.menuService.getById(id, this.languageService.selectedLanguage()?.id).subscribe({
      next: menu => this.menu.set(menu),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }
}
