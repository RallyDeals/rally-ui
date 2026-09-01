import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const adminGuard: CanActivateFn = () => {
  const tokenService = inject(AuthService);
  if (tokenService.currentUser()?.role === "ADMIN") {
    return true;
  }

  const router = inject(Router);
  return router.createUrlTree(['/home']);
};
