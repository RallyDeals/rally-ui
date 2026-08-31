import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileSummary } from './components/profile-summary/profile-summary';
import { ProfileTabs } from './components/profile-tabs/profile-tabs';
import { ProfileTab } from './interfaces/profile-tab';
import { PROFILE_PICTURE_PLACEHOLDER } from '../../shared/constants/placeholder';

@Component({
  selector: 'app-user-profile',
  imports: [ProfileSummary, ProfileTabs, RouterOutlet],
  templateUrl: './user-profile.html',
})
export class UserProfile implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  avatarUrl = PROFILE_PICTURE_PLACEHOLDER;
  userName = '';

  tabs: ProfileTab[] = [
    { id: 'info', label: 'My Info' },
    { id: 'orders', label: 'My Orders' },
    { id: 'deals', label: 'My Deals' },
    { id: 'cards', label: 'My Cards' },
  ];

  ngOnInit() {
    this.userName =
      this.authService.currentUser()?.firstName + ' ' + this.authService.currentUser()?.lastName;
    this.avatarUrl = this.authService.currentUser()?.avatarUrl || this.avatarUrl;
  }

  logout = () => {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/home']);
    });
  };
}
