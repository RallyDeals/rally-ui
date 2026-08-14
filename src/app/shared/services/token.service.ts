import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export type DevRole = 'seller' | 'buyer' | 'admin';

@Injectable({ providedIn: 'root' })
export class TokenService {
  readonly activeRole = signal<DevRole>('seller');

  getToken(): string {
    return environment.devTokens[this.activeRole()] ?? environment.devToken ?? '';
  }

  getSellerId(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return (decoded['sub'] as string | undefined) ?? null;
    } catch {
      return null;
    }
  }

  setRole(role: DevRole) {
    this.activeRole.set(role);
  }
}
