import { Component } from '@angular/core';
import { ProfileSummary } from './profile-summary/profile-summary';
import { ProfileTabs } from './profile-tabs/profile-tabs';
import { PersonalInfo } from './personal-info/personal-info';
import { MyOrders } from './my-orders/my-orders';
import { MyDeals } from './my-deals/my-deals';
import { ProfileTab, ProfileTabId } from './interfaces/profile-tab';

@Component({
  selector: 'app-user-profile',
  imports: [ProfileSummary, ProfileTabs, PersonalInfo, MyOrders, MyDeals],
  templateUrl: './user-profile.html',
})
export class UserProfile {
  avatarUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD58mNB7M3Stz7IlWktdlohliy-OACXslqprlFJNef3LbbFOEZOnTGfSre-pTW0wbckq5yCFT1QM7rzNLL5eX0L_DZk7uV2OEyn-e5wTjYXM3iWjjAczNBOkVgT-U9KMJlcZxcASiDqVvdNEYrVQdOOLj09aQmD58ok0J03FvzSF2Ijr9jjV7ywAYmiwRZPg5Pn5bpR8I7OlKFXO1Fz7htPBOGA1MC3HDlUiQqllcMiuQcGUNsph9MobMNp8DLddt4mPkGzebyEgms';
  userName = 'Alex Johnson';

  tabs: ProfileTab[] = [
    { id: 'personal-info', label: 'Personal Info' },
    { id: 'my-orders', label: 'My Orders' },
    { id: 'my-deals', label: 'My Deals' },
  ];

  // Personal Info opens by default, matching the account icon in the main nav.
  activeTab: ProfileTabId = 'personal-info';

  setActiveTab = (tab: ProfileTabId) => {
    this.activeTab = tab;
  };
}
