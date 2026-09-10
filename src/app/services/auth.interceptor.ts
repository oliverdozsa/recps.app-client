import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, throwError} from 'rxjs';
import {OAuthService} from 'angular-oauth2-oidc';
import {environment} from '../../environments/environment';

function isApiRequest(url: string): boolean {
  return url.startsWith(environment.apiUrl);
}

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const oauth = inject(OAuthService);

  return next(req).pipe(
    catchError(err => {
      if (err instanceof HttpErrorResponse && err.status === 401 && isApiRequest(req.url)) {
        oauth.logOut();
        window.location.reload();
      }
      return throwError(() => err);
    })
  );
};
