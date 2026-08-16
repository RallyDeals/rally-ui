import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { DevRole, TokenService } from '../../services/token.service';

@Component({
  selector: 'app-dev-role-switcher',
  imports: [],
  templateUrl: './dev-role-switcher.html',
  styleUrl: './dev-role-switcher.css',
})
export class DevRoleSwitcher {
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  readonly enabled = !environment.production;
  readonly roles: DevRole[] = ['seller', 'buyer', 'admin'];
  readonly activeRole = this.tokenService.activeRole;

  private readonly roleRoutes: Partial<Record<DevRole, string>> = {
    seller: '/seller',
    buyer: '/home',
    admin: '/admin',
  };

  setRole = (role: DevRole) => {
    this.tokenService.setRole(role);
    const target = this.roleRoutes[role];
    if (target) {
      this.router.navigate([target]);
    }
  };
}
