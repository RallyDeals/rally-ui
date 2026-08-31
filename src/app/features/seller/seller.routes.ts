import { Routes } from '@angular/router';
import { SellerProducts } from './seller-products/seller-products';
import { SellerProductForm } from './seller-product-form/seller-product-form';
import { SellerDeals } from './seller-deals/seller-deals';
import { SellerDealForm } from './seller-deal-form/seller-deal-form';
import { SellerOrders } from './seller-orders/seller-orders';
import { SellerOrderDetail } from './seller-order-detail/seller-order-detail';

export const SELLER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
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
    path: 'orders',
    component: SellerOrders,
  },
  {
    path: 'orders/:id',
    component: SellerOrderDetail,
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
