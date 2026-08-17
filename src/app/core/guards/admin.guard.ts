import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../../shared/services/token.service';

export const adminGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  if (tokenService.activeRole() === 'admin') {
    return true;
  }

  const router = inject(Router);
  return router.createUrlTree(['/home']);
};
