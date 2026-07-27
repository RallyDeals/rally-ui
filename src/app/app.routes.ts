import { Routes } from '@angular/router';
import { AuthLayout } from './core/layout/auth-layout/auth-layout';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { Home } from './core/pages/home/home';
import { AUTH_ROUTES } from './features/auth/auth.routes';


export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'auth',
    component: AuthLayout,
    children: AUTH_ROUTES,
  },
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'home',
        component: Home
      },
    ],
  },
];
