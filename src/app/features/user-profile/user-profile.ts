import { Component, inject, computed, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileSummary } from './components/profile-summary/profile-summary';
import { ProfileTabs } from './components/profile-tabs/profile-tabs';
import { ProfileTab } from './interfaces/profile-tab';
import { PROFILE_PICTURE_PLACEHOLDER } from '../../shared/constants/placeholder';
import { ProfileStore } from './profile-store';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { resolveImageUrl } from '../../shared/utils/image-url';

@Component({
  selector: 'app-user-profile',
  imports: [ProfileSummary, ProfileTabs, RouterOutlet, ErrorState],
  templateUrl: './user-profile.html',
  providers: [ProfileStore],
})
export class UserProfile {
  readonly store = inject(ProfileStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly avatarUrl = computed(() =>
    resolveImageUrl(this.store.profileInfo()?.profilePicture, PLACEHOLDER_IMAGE),
  );

  readonly userName = computed(() => this.store.profileInfo()?.name ?? '');

  tabs: ProfileTab[] = [
    { id: 'info', label: 'My Info' },
    { id: 'orders', label: 'My Orders' },
    { id: 'deals', label: 'My Deals' },
    { id: 'cards', label: 'My Cards' },
    { id: 'security', label: 'Security' },
  ];

  constructor() {
    this.store.load();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}
