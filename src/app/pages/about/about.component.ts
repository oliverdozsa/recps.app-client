import {Component, inject, OnInit} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageService} from '../../services/language.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './about.component.html'
})
export class AboutComponent implements OnInit {
  languageService = inject(LanguageService);

  ngOnInit(): void {
    this.languageService.getAllIfNeeded();
  }
}
