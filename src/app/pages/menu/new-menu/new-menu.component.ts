import {Component, inject} from '@angular/core';
import {MenuViewerEditorComponent} from '../../../components/menu-viewer-editor/menu-viewer-editor.component';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-new-menu',
  imports: [
    MenuViewerEditorComponent,
    TranslatePipe
  ],
  templateUrl: './new-menu.component.html',
  styleUrl: './new-menu.component.css'
})
export class NewMenuComponent {
  protected authService = inject(AuthService);
}
