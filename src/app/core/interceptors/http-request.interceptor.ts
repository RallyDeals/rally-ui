import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../../shared/services/token.service';
import { AuthService } from '../auth/auth.service';

export const httpRequestInterceptor: HttpInterceptorFn = (req, next) => {
  let tokenService = inject(TokenService)
  let authService = inject(AuthService);
  let token = tokenService.getAccessToken();
  let headers: Record<string, string> = {};


  if (token) {
    headers[`Authorization`] = `Bearer ${tokenService.getAccessToken()}`;
  }
// Should be removed once API Gateway is ready.
  if (authService.isLoggedIn()){
        headers[`X-User-Id`] = `${authService.currentUser()?.id}`;
  }
  return next(req.clone({setHeaders: headers}));
};
