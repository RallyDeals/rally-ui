import { Routes } from '@angular/router';
import { SellerDashboard } from './seller-dashboard/seller-dashboard';
import { SellerProducts } from './seller-products/seller-products';
import { SellerProductForm } from './seller-product-form/seller-product-form';
import { SellerDeals } from './seller-deals/seller-deals';
import { SellerDealForm } from './seller-deal-form/seller-deal-form';

export const SELLER_ROUTES: Routes = [
  {
    path: '',
    component: SellerDashboard,
  },
  {
    path: 'deals',
    component: SellerDeals,
  },
  {
    path: 'deals/new',
    component: SellerDealForm,
  },
  {
    path: 'deals/:id/edit',
    component: SellerDealForm,
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
