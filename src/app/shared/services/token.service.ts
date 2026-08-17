import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export type DevRole = 'seller' | 'buyer' | 'admin';

const DEV_ROLE_STORAGE_KEY = 'devRole';
const DEV_ROLES: DevRole[] = ['seller', 'buyer', 'admin'];

function readStoredRole(): DevRole | null {
  const stored = localStorage.getItem(DEV_ROLE_STORAGE_KEY);
  return (DEV_ROLES as string[]).includes(stored ?? '') ? (stored as DevRole) : null;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  readonly activeRole = signal<DevRole>(readStoredRole() ?? 'seller');

  getToken(): string {
    return environment.devTokens[this.activeRole()] ?? environment.devToken ?? '';
  }

  // The token's `sub` claim is the current user's id, whichever role is active — seller, buyer, or admin.
  getUserId(): string | null {
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

  getSellerId(): string | null {
    return this.getUserId();
  }

  setRole(role: DevRole) {
    this.activeRole.set(role);
    localStorage.setItem(DEV_ROLE_STORAGE_KEY, role);
  }
}
