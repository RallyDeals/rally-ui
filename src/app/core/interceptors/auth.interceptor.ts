import { HttpInterceptorFn } from '@angular/common/http';
import { getAuthToken } from '../auth/auth-token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getAuthToken();
  if (!token) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
