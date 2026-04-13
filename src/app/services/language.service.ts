import {effect, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {LanguageResponse} from './responses';
import {environment} from '../../environments/environment';
import {TranslateService} from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private http = inject(HttpClient);
  private translate = inject(TranslateService);
  private baseUrl = environment.apiUrl;

  languages = signal<LanguageResponse[]>([]);
  selectedLanguage = signal<LanguageResponse | null>(null);
  loading = signal<boolean>(false);

  constructor() {
    effect(() => {
      const lang = this.selectedLanguage();
      if (lang?.isoName) {
        this.translate.use(lang.isoName);
      }
    });
  }

  getAll(): Observable<LanguageResponse[]> {
    this.loading.set(true);
    return this.http.get<LanguageResponse[]>(`${this.baseUrl}/languages`).pipe(
      tap(langs => {
        this.languages.set(langs);
        this.loading.set(false);
        if (langs.length > 0 && !this.selectedLanguage()) {
          const browserLang = navigator.language.split('-')[0].toLowerCase();
          const match = langs.find(l => l.isoName?.toLowerCase() === browserLang);
          const fallback = langs.find(l => l.isoName?.toLowerCase() === 'en') ?? langs[0];
          this.selectedLanguage.set(match ?? fallback);
        }
      })
    );
  }

  getAllIfNeeded() {
    if (this.languages().length == 0) {
      this.getAll().subscribe(() => {
      });
    }
  }
}
