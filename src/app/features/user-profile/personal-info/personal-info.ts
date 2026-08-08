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
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD58mNB7M3Stz7IlWktdlohliy-OACXslqprlFJNef3LbbFOEZOnTGfSre-pTW0wbckq5yCFT1QM7rzNLL5eX0L_DZk7uV2OEyn-e5wTjYXM3iWjjAczNBOkVgT-U9KMJlcZxcASiDqVvdNEYrVQdOOLj09aQmD58ok0J03FvzSF2Ijr9jjV7ywAYmiwRZPg5Pn5bpR8I7OlKFXO1Fz7htPBOGA1MC3HDlUiQqllcMiuQcGUNsph9MobMNp8DLddt4mPkGzebyEgms',
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
