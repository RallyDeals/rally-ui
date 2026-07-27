import { Routes } from '@angular/router';
import { AuthLayout } from './core/layout/auth-layout/auth-layout';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { Home } from './core/pages/home/home';
import { About } from './core/pages/about/about';
import { Contact } from './core/pages/contact/contact';
import { Categories } from './features/categories/categories';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { PRODUCTS_ROUTES } from './features/products/products.routes';
import { DEALS_ROUTES } from './features/deals/deals.routes';
import { Cart } from './features/cart/cart';
import { USER_PROFILE_ROUTES } from './features/user-profile/user-profile.routes';


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
      {
        path: 'about-us',
        component: About
      },
      {
        path: 'contact-us',
        component: Contact
      },
      {
        path: 'categories',
        component: Categories
      },
      {
        path: 'cart',
        component: Cart
      },
      {
        path: 'profile',
        children: USER_PROFILE_ROUTES,
      },
      {
        path: 'products',
        children: PRODUCTS_ROUTES
      },
      {
        path: 'deals',
        children: DEALS_ROUTES
      }
    ],
  },
];
