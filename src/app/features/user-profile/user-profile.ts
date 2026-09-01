import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ProfileSummary } from './components/profile-summary/profile-summary';
import { ProfileTabs } from './components/profile-tabs/profile-tabs';
import { ProfileTab } from './interfaces/profile-tab';
import { ProfileStore } from './profile-store';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { PLACEHOLDER_IMAGE } from '../../shared/constants/placeholder';
import { resolveImageUrl } from '../../shared/utils/image-url';
import { AuthService } from '../../core/auth/auth.service';

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
    { id: 'personal-info', label: 'Personal Info' },
    { id: 'my-orders', label: 'My Orders' },
    { id: 'my-deals', label: 'My Deals' },
    { id: 'my-payment-methods', label: 'My Payment Methods' },
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
