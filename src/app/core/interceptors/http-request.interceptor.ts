import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../../shared/services/token.service';
import { AuthService } from '../auth/auth.service';

export const httpRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getAccessToken();
  const headers: Record<string, string> = {};
  const authService = inject(AuthService);
  const userId = authService.currentUser()?.id;
  if (token) {
    headers[`Authorization`] = `Bearer ${token}`;
  }
  // if (userId) {
  //       headers[`X-User-Id`] = `${userId}`;

  // }

  return next(req.clone({ setHeaders: headers }));
};
