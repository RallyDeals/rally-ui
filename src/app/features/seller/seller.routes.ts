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
    title: 'Deals',
  },
  {
    path: 'deals/new',
    component: SellerDealForm,
    title: 'New Deal',
  },
  {
    path: 'deals/:id/edit',
    component: SellerDealForm,
    title: 'Edit Deal',
  },
  {
    path: 'orders',
    component: SellerOrders,
    title: 'Orders',
  },
  {
    path: 'orders/:id',
    component: SellerOrderDetail,
    title: 'Order Details',
  },
  {
    path: 'products',
    component: SellerProducts,
    title: 'Products',
  },
  {
    path: 'products/new',
    component: SellerProductForm,
    title: 'New Product',
  },
  {
    path: 'products/:id/edit',
    component: SellerProductForm,
    title: 'Edit Product',
  },
];
