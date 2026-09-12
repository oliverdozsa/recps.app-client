import {inject, Injectable, signal} from '@angular/core';
import {OAuthService} from 'angular-oauth2-oidc';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {NotificationsService} from './notifications.service';
import {SearchStateService} from './search-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private oauthService = inject(OAuthService);
  private router = inject(Router);
  private notifications = inject(NotificationsService);
  private searchState = inject(SearchStateService);
  private translate = inject(TranslateService);

  private isLoggedInSignal = signal(false);
  isLoggedIn = this.isLoggedInSignal.asReadonly();

  constructor() {
    this.oauthService.setStorage(localStorage);

    this.oauthService.configure({
      issuer: "https://accounts.google.com",
      strictDiscoveryDocumentValidation: false,
      clientId: "39099012072-mtapaq50ir89bif3uipttsuhk550te1v.apps.googleusercontent.com",
      redirectUri: window.location.origin + "/home",
      scope: "openid profile email"
    });

    // The oauth library fires these outside places Angular is already re-rendering
    // (e.g. right after the redirect back from the login flow), so this is the only
    // reliable way to keep isLoggedIn in sync with the actual token state.
    this.oauthService.events.subscribe(() => this.syncIsLoggedIn());

    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.loadDiscoveryDocumentAndTryLogin()
      .then(() => this.onTryLoginComplete());
  }

  private syncIsLoggedIn() {
    this.isLoggedInSignal.set(this.oauthService.hasValidIdToken());
  }

  login() {
    this.oauthService.initLoginFlow(this.router.url);
  }

  logout() {
    this.searchState.clearCollections();
    this.oauthService.revokeTokenAndLogout();
    this.oauthService.logOut();
    this.syncIsLoggedIn();
  }

  getProfile() {
    return this.oauthService.getIdentityClaims();
  }

  private onTryLoginComplete() {
    this.syncIsLoggedIn();

    let stateUrl = this.oauthService.state!;

    if (stateUrl) {
      if (!stateUrl.startsWith('/')) {
        stateUrl = decodeURIComponent(stateUrl);
      }

      setTimeout(() => this.router.navigateByUrl(stateUrl));
    }

    if (this.isLoggedIn()) {
      setTimeout(() => this.notifications.success(this.translate.instant("login.welcomeMessage")));
    }
  }
}
