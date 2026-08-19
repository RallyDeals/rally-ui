import { OrderStatus } from '../../../shared/models/order-status';
import { OrderType } from '../../../shared/models/order-type';
import { OrderItem } from './order-item';
import { CancelReason } from '../../../shared/models/cancel-reason';

export interface CheckoutOrderResponse {
  id: string;
  userId: string;
  orderProducts: OrderItem[];
  orderType: OrderType;
  status: OrderStatus;
  cancelReason: CancelReason;
  totalPrice: number;
  createdAt: string;
}
