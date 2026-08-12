import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export type DevRole = 'seller' | 'buyer' | 'admin';

@Injectable({ providedIn: 'root' })
export class TokenService {
  readonly activeRole = signal<DevRole>('seller');

  getToken(): string {
    return environment.devTokens[this.activeRole()] ?? environment.devToken ?? '';
  }

  setRole(role: DevRole) {
    this.activeRole.set(role);
  }
}
