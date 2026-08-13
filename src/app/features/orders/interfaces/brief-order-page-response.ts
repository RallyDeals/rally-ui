import { BriefOrderResponse } from './brief-order-response';

export interface BriefOrderPageResponse {
  orders: BriefOrderResponse[];
  page: number;
  limit: number;
  total: number;
}
