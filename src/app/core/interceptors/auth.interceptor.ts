import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { getAuthToken } from '../auth/auth-token';
import { TokenService } from '../../shared/services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getAuthToken() ?? inject(TokenService).getToken();
  if (!token) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
