import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Shared across concurrent requests so a burst of 401s triggers a single
 * /auth/refresh call instead of one per request.
 */
@Injectable({ providedIn: 'root' })
export class TokenRefreshState {
  isRefreshing = false;
  readonly refreshedToken$ = new BehaviorSubject<string | null>(null);
}
