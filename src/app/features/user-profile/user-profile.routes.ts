import { Routes } from '@angular/router';
import { UserProfile } from './user-profile';
import { PersonalInfo } from './personal-info/personal-info';
import { MyOrders } from './my-orders/my-orders';
import { MyDeals } from './my-deals/my-deals';
import { PaymentMethods } from './my-payment-methods/my-payment-methods';
import { Security } from './security/security';

export const USER_PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: UserProfile,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'info' },
      { path: 'info', component: PersonalInfo, title: 'Personal Info' },
      { path: 'orders', component: MyOrders, title: 'My Orders' },
      { path: 'deals', component: MyDeals, title: 'My Deals' },
       {path: 'cards' , component:PaymentMethods, title: 'Payment Methods'},
      { path: 'security', component: Security, title: 'Security' },
    ],
  },
];
