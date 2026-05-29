import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {RecipeSearchResponse} from '../../services/responses';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-recipe-compact-card',
  imports: [TranslatePipe],
  templateUrl: './recipe-compact-card.component.html',
  styleUrl: './recipe-compact-card.component.css'
})
export class RecipeCompactCardComponent {
  @Input()
  recipe!: RecipeSearchResponse;

  @Input()
  selected: boolean = false;

  @Input()
  editMode: boolean = false;

  @Input()
  deleteMode: boolean = false;

  @Input()
  addMode: boolean = false;

  @Output()
  onBackClicked= new EventEmitter<void>();

  @Output()
  onDeleteClicked = new EventEmitter<void>();

  @Output()
  onAddClicked = new EventEmitter<void>();

  imageError = signal(false);


}
