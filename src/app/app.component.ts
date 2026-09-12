import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {LanguageService} from './services/language.service';
import {SearchStateService} from './services/search-state.service';
import {AuthService} from './services/auth.service';
import {AppHeaderComponent} from './components/app-header/app-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppHeaderComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private languageService = inject(LanguageService);
  private searchState = inject(SearchStateService);
  private authService = inject(AuthService);
  readonly year = new Date().getFullYear();

  ngOnInit(): void {
    this.languageService.getAllIfNeeded();
    this.searchState.getSourcePages().subscribe(pages => this.searchState.sourcePages.set(pages));
  }
}
