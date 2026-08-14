import { Routes } from '@angular/router';
import { SellerDashboard } from './seller-dashboard/seller-dashboard';
import { SellerProducts } from './seller-products/seller-products';
import { SellerProductForm } from './seller-product-form/seller-product-form';

export const SELLER_ROUTES: Routes = [
  {
    path: '',
    component: SellerDashboard,
  },
  {
    path: 'products',
    component: SellerProducts,
  },
  {
    path: 'products/new',
    component: SellerProductForm,
  },
  {
    path: 'products/:id/edit',
    component: SellerProductForm,
  },
];
