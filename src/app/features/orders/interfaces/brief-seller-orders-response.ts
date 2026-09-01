import { OrderType } from '../../../shared/models/order-type';
import { CompactedOrderStatus } from '../../../shared/models/compacted-order-status';
import { OrderItem } from './order-item';

export interface BriefSellerOrdersResponse{
  orderId: string;
  status: CompactedOrderStatus;
  type: OrderType;
  createdAt: Date;
  totalPrice: number;
  items: OrderItem[];
}
