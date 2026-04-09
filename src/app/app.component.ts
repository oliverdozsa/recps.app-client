import {Component, inject, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {AuthService} from './services/auth.service';
import {LoginComponent} from './components/login/login.component';
import {LanguageSwitcherComponent} from './components/language-switcher/language-switcher.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent, LanguageSwitcherComponent, RouterLink, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'recps.app-client';

  authService = inject(AuthService);

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.HSStaticMethods) {
            window.HSStaticMethods.autoInit();
          }
        }, 100);
      }
    });
  }
}
