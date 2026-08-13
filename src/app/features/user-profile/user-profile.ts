import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProfileSummary } from './profile-summary/profile-summary';
import { ProfileTabs } from './profile-tabs/profile-tabs';
import { ProfileTab } from './interfaces/profile-tab';

@Component({
  selector: 'app-user-profile',
  imports: [ProfileSummary, ProfileTabs, RouterOutlet],
  templateUrl: './user-profile.html',
})
export class UserProfile {
  avatarUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBHSol_IxxKg-QlxhfK4We-hTAfWhkOLPIQ1TxgecpcFSkrQlLUqIdxLUVNdsiimfTGmgY2uHGSUDyILFA3LcqOdkOJMb21zUKK2d48TUodmjamQ2xf8Nd5QIq8WXRrn7CLxz-lpnoZO3_1WfE3baCJFBGr5LnVAt2xNmvTARnrX4W2qv6uFTtptYsnK1Q2UyTL5dueCR6WSemU-kTunJtXL1-qzfFLmHqa7hBGjMRZJEtBAuFE8Dd4awphHXylEZRkzA';
  userName = 'Alex Johnson';

  tabs: ProfileTab[] = [
    { id: 'personal-info', label: 'Personal Info' },
    { id: 'my-orders', label: 'My Orders' },
    { id: 'my-deals', label: 'My Deals' },
  ];
}
