import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthService} from '../../../services/auth.service';
import {MenuService} from '../../../services/menu.service';
import {LanguageService} from '../../../services/language.service';
import {MenuPlanDetailedResponse} from '../../../services/responses';
import {MenuViewerEditorComponent} from '../../../components/menu-viewer-editor/menu-viewer-editor.component';

@Component({
  selector: 'app-view-edit-menu',
  standalone: true,
  imports: [TranslatePipe, MenuViewerEditorComponent],
  templateUrl: './view-edit-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewEditMenuComponent implements OnInit {
  authService = inject(AuthService);
  private menuService = inject(MenuService);
  private languageService = inject(LanguageService);
  private route = inject(ActivatedRoute);

  menu = signal<MenuPlanDetailedResponse | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn) {
      this.loading.set(false);
      return;
    }
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.menuService.getById(id, this.languageService.selectedLanguage()?.id).subscribe({
      next: menu => {
        this.menu.set(menu);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
