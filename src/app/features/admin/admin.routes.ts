import { Routes } from '@angular/router';
import { UserManagement } from './user-management/user-management';
import { SellerManagement } from './seller-management/seller-management';
import { SellerDetails } from './seller-management/seller-details/seller-details';
import { ProductApprovals } from './product-approvals/product-approvals';
import { CategoriesManagement } from './categories-management/categories-management';
import { DealsManagement } from './deals-management/deals-management';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'product-approvals',
    pathMatch: 'full',
  },
  {
    path: 'user-management',
    component: UserManagement,
    title: 'User Management',
  },
  {
    path: 'categories-management',
    component: CategoriesManagement,
    title: 'Categories Management',
  },
  {
    path: 'deals-management',
    component: DealsManagement,
    title: 'Deals Management',
  },
  {
    path: 'seller-management',
    component: SellerManagement,
    title: 'Seller Management',
  },
  {
    path: 'seller-management/:sellerId',
    component: SellerDetails,
    title: 'Seller Details',
  },
  {
    path: 'product-approvals',
    component: ProductApprovals,
    title: 'Product Approvals',
  },
];
