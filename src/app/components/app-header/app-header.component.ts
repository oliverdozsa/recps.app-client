import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {SearchStateService} from '../../services/search-state.service';
import {LoginComponent} from '../login/login.component';
import {LanguageSwitcherComponent} from '../language-switcher/language-switcher.component';
import {ClickOutsideDirective} from '../../directives/click-outside.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe, LoginComponent, LanguageSwitcherComponent, ClickOutsideDirective],
  templateUrl: './app-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeaderComponent {
  state = inject(SearchStateService);

  navOpen = signal(false);

  onNameQueryChange(value: string) {
    this.state.setNameQuery(value);
  }

  toggleNav() {
    this.navOpen.update(v => !v);
  }

  closeNav() {
    this.navOpen.set(false);
  }
}
