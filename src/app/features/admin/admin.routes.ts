import { Routes } from '@angular/router';
import { ProductApprovals } from './product-approvals/product-approvals';
import { CategoriesManagement } from './categories-management/categories-management';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'product-approvals',
    pathMatch: 'full',
  },
  {
    path: 'categories-management',
    component: CategoriesManagement,
  },
  {
    path: 'product-approvals',
    component: ProductApprovals,
  },
];
