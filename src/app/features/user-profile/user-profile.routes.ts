import { Routes } from '@angular/router';
import { UserProfile } from './user-profile';

export const USER_PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: UserProfile,
    children: [
      { path: '', redirectTo: 'info', pathMatch: 'full' },
      { path: 'info', loadComponent: () => import('./profile-info/profile-info').then(m => m.ProfileInfo) },
      { path: 'orders', loadComponent: () => import('./my-orders/my-orders').then(m => m.MyOrders) },
      { path: 'deals', loadComponent: () => import('./active-deals/active-deals').then(m => m.ActiveDeals) }
    ]
  }
];
