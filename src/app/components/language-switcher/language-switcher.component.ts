import {Component, inject, signal} from '@angular/core';
import {LanguageService} from '../../services/language.service';
import {LanguageResponse} from '../../services/responses';
import {ClickOutsideDirective} from '../../directives/click-outside.directive';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [ClickOutsideDirective],
  templateUrl: './language-switcher.component.html'
})
export class LanguageSwitcherComponent {
  languageService = inject(LanguageService);

  open = signal(false);

  toggle() {
    this.open.update(v => !v);
  }

  close() {
    this.open.set(false);
  }

  select(lang: LanguageResponse): void {
    this.languageService.selectedLanguage.set(lang);
    this.close();
  }
}
