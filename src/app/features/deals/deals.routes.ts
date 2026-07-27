import { Routes } from '@angular/router';
import { BrowseDeals } from './browse-deals/browse-deals';
import { DealDetails } from './deal-details/deal-details';

export const DEALS_ROUTES: Routes = [
  {
    path: '',
    component: BrowseDeals,
  },
  {
    path: '{id}',
    component: DealDetails,
  },
];
