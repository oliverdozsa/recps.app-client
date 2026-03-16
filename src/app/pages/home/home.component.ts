import { Component } from '@angular/core';
import {TagsInputComponent} from '../../components/tags-input/tags-input.component';

@Component({
  selector: 'app-home',
  imports: [
    TagsInputComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
