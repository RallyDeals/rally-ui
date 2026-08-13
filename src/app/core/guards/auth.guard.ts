import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isAuthenticated } from '../auth/auth-token';

export const authGuard: CanActivateFn = (_route, state) => {
  if (isAuthenticated()) {
    return true;
  }

  const router = inject(Router);
  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};
