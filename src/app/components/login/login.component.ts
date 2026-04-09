import {Component, inject} from '@angular/core';
import {NgIf} from "@angular/common";
import {AuthService} from '../../services/auth.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [
    NgIf,
    TranslatePipe
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  authService = inject(AuthService);

  get picture() {
    return this.authService.getProfile()["picture"];
  }

  get name() {
    return this.authService.getProfile()["name"];
  }
}
