import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileSummary } from './components/profile-summary/profile-summary';
import { ProfileTabs } from './components/profile-tabs/profile-tabs';
import { ProfileTab } from './interfaces/profile-tab';

@Component({
  selector: 'app-user-profile',
  imports: [ProfileSummary, ProfileTabs, RouterOutlet],
  templateUrl: './user-profile.html',
})
export class UserProfile {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  avatarUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBHSol_IxxKg-QlxhfK4We-hTAfWhkOLPIQ1TxgecpcFSkrQlLUqIdxLUVNdsiimfTGmgY2uHGSUDyILFA3LcqOdkOJMb21zUKK2d48TUodmjamQ2xf8Nd5QIq8WXRrn7CLxz-lpnoZO3_1WfE3baCJFBGr5LnVAt2xNmvTARnrX4W2qv6uFTtptYsnK1Q2UyTL5dueCR6WSemU-kTunJtXL1-qzfFLmHqa7hBGjMRZJEtBAuFE8Dd4awphHXylEZRkzA';
  userName = 'Alex Johnson';

  tabs: ProfileTab[] = [
    { id: 'personal-info', label: 'Personal Info' },
    { id: 'my-orders', label: 'My Orders' },
    { id: 'my-deals', label: 'My Deals' },
     { id: 'my-payment-methods', label: 'My Payment Methods' },
  ];

  logout = () => {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/home']);
    });
  };
}
