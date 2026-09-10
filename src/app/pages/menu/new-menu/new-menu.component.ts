import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthService} from '../../../services/auth.service';
import {MenuViewerEditorComponent} from '../../../components/menu-viewer-editor/menu-viewer-editor.component';

@Component({
  selector: 'app-new-menu',
  standalone: true,
  imports: [TranslatePipe, MenuViewerEditorComponent],
  templateUrl: './new-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewMenuComponent {
  authService = inject(AuthService);
}
