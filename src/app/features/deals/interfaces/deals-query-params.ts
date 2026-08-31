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
  // buyer browse + dashboards
  search?: string; // product name

  // buyer browse
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: DealSortKey;

  // dashboards + buyer profile
  sellerId?: string;
  status?: DealStatus | string;

  // product details
  productId?: string;

  page?: number;
  limit?: number;
}
