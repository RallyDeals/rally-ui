import { CompactedOrderStatus } from '../../../shared/models/compacted-order-status';
import { OrderType } from '../../../shared/models/order-type';
import { CancelReason } from 'vitest';
import { OrderItem } from './order-item';

export interface DetailedSellerOrderResponse{
  orderId: string;
  status: CompactedOrderStatus;
  type: OrderType;
  cancelReason: CancelReason;
  address: string;
  createdAt: Date;
  totalPrice: number;
  items: OrderItem[];
}
