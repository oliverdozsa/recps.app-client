import {Component, inject, OnInit} from '@angular/core';
import {MenuViewerEditorComponent} from '../../components/menu-viewer-editor/menu-viewer-editor.component';
import {MarkedRecipesService} from '../../services/marked-recipes.service';


@Component({
  selector: 'app-menu',
  imports: [
    MenuViewerEditorComponent
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  markedRecipesService = inject(MarkedRecipesService)
}
