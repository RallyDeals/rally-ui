import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { UserProfile } from '../../core/auth/models';
import { ApiError } from '../../shared/models/api-error';
import { toApiError } from '../../shared/utils/api-error.util';

/**
 * Shared state for the user-profile section. Loaded once by the shell and
 * consumed by the header plus every child tab via DI, so mutations made in
 * one tab (avatar upload, profile edit) are reflected everywhere instantly.
 */
@Injectable()
export class ProfileStore {
  private readonly authService = inject(AuthService);

  readonly profileInfo = signal<UserProfile | null>(null);
  readonly dealsJoinedCount = signal <number>(0);
  readonly ordersCount = signal <number>(0);
  readonly isLoading = signal(false);
  readonly loadError = signal<ApiError | null>(null);

  /** GET /auth/me */
  load(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.authService.getPersonalInfo().subscribe({
      next: (profile) => {
        this.profileInfo.set(profile.info);
        this.dealsJoinedCount.set(profile.dealsJoinedCount)
        this.ordersCount.set(profile.ordersCount)
        this.isLoading.set(false);
      },
      error: (err) => {
        this.loadError.set(toApiError(err));
        this.isLoading.set(false);
      },
    });
  }

  /** Replaces the stored profile after a successful PATCH /auth/me. */
  setProfile(profile: UserProfile): void {
    this.profileInfo.set(profile);
  }

  /** Applies a freshly uploaded avatar path (POST /auth/me/avatar response). */
  applyAvatarPath(path: string): void {
    this.profileInfo.update((current) =>
      current ? { ...current, profilePicture: path } : current,
    );
  }
}
