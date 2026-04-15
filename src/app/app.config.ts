import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideHttpClient, withInterceptors, withInterceptorsFromDi} from '@angular/common/http';
import {OAuthStorage, provideOAuthClient} from 'angular-oauth2-oidc';

import {provideTranslateService} from '@ngx-translate/core';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import {environment} from '../environments/environment';
import {authErrorInterceptor} from './services/auth.interceptor';

export function storageFactory(): OAuthStorage {
  return localStorage
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authErrorInterceptor]), withInterceptorsFromDi()),
    provideOAuthClient({resourceServer: {allowedUrls: [environment.apiUrl, "localhost"], sendAccessToken: true}}),
    {provide: OAuthStorage, useFactory: storageFactory},
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: "/i18n/",
        suffix: ".json"
      }),
      fallbackLang: "en",
      lang: "en"
    })
  ]
};
