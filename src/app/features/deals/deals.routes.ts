import { Routes } from '@angular/router';
import { BrowseDeals } from './browse-deals/browse-deals';
import { DealDetails } from './deal-details/deal-details';

export const DEALS_ROUTES: Routes = [
  {
    path: '',
    component: BrowseDeals,
    title: 'Deals',
  },
  {
    path: ':id',
    component: DealDetails,
    title: 'Deal Details',
  },
];
