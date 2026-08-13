import { Component } from '@angular/core';
import { InfoField } from './info-field/info-field';
import { ProfileInfo } from '../interfaces/profile-info';

@Component({
  selector: 'app-personal-info',
  imports: [InfoField],
  templateUrl: './personal-info.html',
})
export class PersonalInfo {
  profile: ProfileInfo = {
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBHSol_IxxKg-QlxhfK4We-hTAfWhkOLPIQ1TxgecpcFSkrQlLUqIdxLUVNdsiimfTGmgY2uHGSUDyILFA3LcqOdkOJMb21zUKK2d48TUodmjamQ2xf8Nd5QIq8WXRrn7CLxz-lpnoZO3_1WfE3baCJFBGr5LnVAt2xNmvTARnrX4W2qv6uFTtptYsnK1Q2UyTL5dueCR6WSemU-kTunJtXL1-qzfFLmHqa7hBGjMRZJEtBAuFE8Dd4awphHXylEZRkzA',
    avatarAlt: 'Profile picture',
    joinedLabel: 'Joined October 2023',
    totalDealsJoined: 14,
    totalOrdersMade: 22,
    fields: [
      { label: 'First Name', value: 'Alex' },
      { label: 'Last Name', value: 'Johnson' },
      { label: 'Email Address', value: 'alex.j@example.com', icon: 'mail' },
      { label: 'Phone Number', value: '+1 (555) 019-2834', icon: 'phone_iphone' },
    ],
  };
}
