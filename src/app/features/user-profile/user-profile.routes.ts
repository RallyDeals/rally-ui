import { Routes } from '@angular/router';
import { UserProfile } from './user-profile';
import { PersonalInfo } from './personal-info/personal-info';
import { MyOrders } from './my-orders/my-orders';
import { MyDeals } from './my-deals/my-deals';

export const USER_PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: UserProfile,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'personal-info' },
      { path: 'personal-info', component: PersonalInfo },
      { path: 'my-orders', component: MyOrders },
      { path: 'my-deals', component: MyDeals },
    ],
  },
];
