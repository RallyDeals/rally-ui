import { Routes } from '@angular/router';
import { ProductApprovals } from './product-approvals/product-approvals';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'product-approvals',
    pathMatch: 'full',
  },
  {
    path: 'product-approvals',
    component: ProductApprovals,
  },
];
