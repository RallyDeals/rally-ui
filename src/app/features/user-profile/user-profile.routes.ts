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
      { path: 'info', component: PersonalInfo },
      { path: 'orders', component: MyOrders },
      { path: 'deals', component: MyDeals },
       {path: 'cards' , component:PaymentMethods},
      { path: 'security', component: Security },
    ],
  },
];
