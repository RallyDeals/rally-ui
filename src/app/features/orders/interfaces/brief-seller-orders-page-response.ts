import { BriefSellerOrdersResponse } from './brief-seller-orders-response';

export interface BriefSellerOrdersPageResponse {
  orders: BriefSellerOrdersResponse[];
  page: number;
  limit: number;
  total: number;
}
