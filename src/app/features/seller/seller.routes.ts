import { Routes } from '@angular/router';
import { SellerDashboard } from './seller-dashboard/seller-dashboard';
import { SellerProducts } from './seller-products/seller-products';

export const SELLER_ROUTES: Routes = [
  {
    path: '',
    component: SellerDashboard,
  },
  {
    path: 'products',
    component: SellerProducts,
  },
];
