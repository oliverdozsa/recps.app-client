import { Component } from '@angular/core';
import {TagsInputComponent} from "../tags-input/tags-input.component";

@Component({
  selector: 'app-ingredients-input',
    imports: [
        TagsInputComponent
    ],
  templateUrl: './ingredients-input.component.html',
  styleUrl: './ingredients-input.component.css'
})
export class IngredientsInputComponent {

}
