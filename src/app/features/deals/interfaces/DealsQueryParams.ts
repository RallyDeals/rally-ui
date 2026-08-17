import { DealStatus } from '../../../shared/models/deal';

export interface DealsQueryParams {
  search?: string;
  status?: DealStatus;
  category?: string;
  sellerId?: string;
  productId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
