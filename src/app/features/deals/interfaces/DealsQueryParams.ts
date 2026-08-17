import { DealStatus } from '../../../shared/models/deal';

export type DealSortKey =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'discount'
  | 'ending-soon'
  | 'most-joined'
  | 'newest';

export interface DealsQueryParams {
  // buyer browse
  search?: string; // product name/seller name
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: DealSortKey;

  // dashboards
  sellerId?: string;
  status?: DealStatus;

  // buyer profile ("my deals" — all statuses, scoped to deals this buyer joined)
  participantId?: string;

  // product details
  productId?: string;

  page?: number;
  limit?: number;
}
