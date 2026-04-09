import {Component, inject, OnInit, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageService} from '../../services/language.service';

@Component({
  selector: 'app-about',
  imports: [
    TranslatePipe
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit {
  languageService = inject(LanguageService);

  ngOnInit(): void {
    this.languageService.getAllIfNeeded();
  }
}
