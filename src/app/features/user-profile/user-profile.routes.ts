import { Routes } from '@angular/router';
import { UserProfile } from './user-profile';

export const USER_PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: UserProfile,
    children: [

    ]
  }
];
