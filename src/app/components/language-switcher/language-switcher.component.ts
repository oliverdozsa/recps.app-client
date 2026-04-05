import {Component, inject} from '@angular/core';
import {LanguageService} from '../../services/language.service';
import {LanguageResponse} from '../../services/responses';

const FLAGS: Record<string, string> = {
  en: '🇬🇧',
  hu: '🇭🇺'
};

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html'
})
export class LanguageSwitcherComponent {
  languageService = inject(LanguageService);

  flagFor(isoName: string | undefined): string {
    return FLAGS[isoName ?? ''] ?? '🌐';
  }

  select(lang: LanguageResponse): void {
    this.languageService.selectedLanguage.set(lang);
  }
}
