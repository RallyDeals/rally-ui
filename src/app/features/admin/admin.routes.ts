import { Routes } from '@angular/router';
import { UserManagement } from './user-management/user-management';
import { SellerManagement } from './seller-management/seller-management';
import { SellerDetails } from './seller-management/seller-details/seller-details';
import { ProductApprovals } from './product-approvals/product-approvals';
import { CategoriesManagement } from './categories-management/categories-management';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'product-approvals',
    pathMatch: 'full',
  },
  {
    path: 'user-management',
    component: UserManagement,
  },
  {
    path: 'categories-management',
    component: CategoriesManagement,
  },
  {
    path: 'seller-management',
    component: SellerManagement,
  },
  {
    path: 'seller-management/:sellerId',
    component: SellerDetails,
  },
  {
    path: 'product-approvals',
    component: ProductApprovals,
  },
];
