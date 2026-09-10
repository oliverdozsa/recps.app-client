import {Component, inject, signal} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {TranslatePipe} from '@ngx-translate/core';
import {ClickOutsideDirective} from '../../directives/click-outside.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TranslatePipe, ClickOutsideDirective],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  authService = inject(AuthService);

  open = signal(false);

  toggle() {
    this.open.update(v => !v);
  }

  close() {
    this.open.set(false);
  }

  get picture() {
    return this.authService.getProfile()['picture'];
  }

  get name() {
    return this.authService.getProfile()['name'];
  }
}
