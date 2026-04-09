import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {OAuthStorage, provideOAuthClient} from 'angular-oauth2-oidc';
import {environmentProd} from '../environments/environment.prod';
import {provideTranslateService} from '@ngx-translate/core';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';

export function storageFactory(): OAuthStorage {
  return localStorage
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideOAuthClient({resourceServer: {allowedUrls: [environmentProd.apiUrl, "localhost"], sendAccessToken: true}}),
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
