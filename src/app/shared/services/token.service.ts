import { Injectable } from '@angular/core';
import { UserSummary } from '../../core/auth/models';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'authUser';

/**
 * "Remember me" decides where the session lives: localStorage survives
 * browser restarts, sessionStorage is cleared when the tab/browser closes.
 * Reads check both so a session works regardless of which one it's in.
 */
@Injectable({ providedIn: 'root' })
export class TokenService {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /** Whether the current session was stored with "remember me" (localStorage). */
  isPersisted(): boolean {
    return localStorage.getItem(ACCESS_TOKEN_KEY) !== null;
  }

  storeTokens(accessToken: string, refreshToken: string, persist: boolean): void {
    const storage = persist ? localStorage : sessionStorage;
    storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  storeUser(user: UserSummary, persist: boolean): void {
    const storage = persist ? localStorage : sessionStorage;
    storage.setItem(USER_KEY, JSON.stringify(user));
  }

  readStoredUser(): UserSummary | null {
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as UserSummary;
    } catch {
      return null;
    }
  }

  clear(): void {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem(ACCESS_TOKEN_KEY);
      storage.removeItem(REFRESH_TOKEN_KEY);
      storage.removeItem(USER_KEY);
    }
  }
}
