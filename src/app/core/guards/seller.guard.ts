import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../../shared/services/token.service';
import { AuthService } from '../auth/auth.service';

export const sellerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  if (authService.currentUser()?.role === 'SELLER') {
    return true;
  }

  const router = inject(Router);
  return router.createUrlTree(['/home']);
};
