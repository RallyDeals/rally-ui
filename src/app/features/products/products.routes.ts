import { Routes } from '@angular/router';
import { BrowseProducts } from './browse-products/browse-products';
import { ProductDetails } from './product-details/product-details';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: BrowseProducts
  },
  {
    path: '{id}',
    component: ProductDetails,
  }
];
