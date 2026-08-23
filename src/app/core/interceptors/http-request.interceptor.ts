import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../../shared/services/token.service';

export const httpRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getAccessToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers[`Authorization`] = `Bearer ${token}`;
  }

  return next(req.clone({ setHeaders: headers }));
};
