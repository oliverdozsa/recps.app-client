import {Component, OnInit} from '@angular/core';
import {MenuViewerEditorComponent} from '../../components/menu-viewer-editor/menu-viewer-editor.component';


@Component({
  selector: 'app-menu',
  imports: [
    MenuViewerEditorComponent
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
}
