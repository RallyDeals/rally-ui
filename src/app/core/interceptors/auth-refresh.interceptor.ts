import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TokenService } from '../../shared/services/token.service';
import { TokenRefreshState } from './token-refresh-state.service';

const REFRESH_EXEMPT_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/verify-email',
  '/auth/logout',
];

/**
 * On a 401, refreshes the token pair once and retries the failed request.
 * Concurrent 401s during an in-flight refresh queue behind it instead of
 * each triggering their own /auth/refresh call.
 */
export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const refreshState = inject(TokenRefreshState);
  const router = inject(Router);

  if (REFRESH_EXEMPT_PATHS.some((path) => req.url.includes(path))) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || !tokenService.getRefreshToken()) {
        return throwError(() => error);
      }

      if (!refreshState.isRefreshing) {
        refreshState.isRefreshing = true;
        refreshState.refreshedToken$.next(null);

        return authService.refresh().pipe(
          switchMap((res) => {
            refreshState.isRefreshing = false;
            refreshState.refreshedToken$.next(res.accessToken);
            return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } }));
          }),
          catchError((refreshError: unknown) => {
            refreshState.isRefreshing = false;
            authService.clearSession();
            router.navigate(['/auth/login'], { queryParams: { returnUrl: router.url } });
            return throwError(() => refreshError);
          }),
        );
      }

      return refreshState.refreshedToken$.pipe(
        filter((token): token is string => token !== null),
        take(1),
        switchMap((token) => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))),
      );
    }),
  );
};
