import { OrderType } from '../../../shared/models/order-type';
import { OrderStatus } from '../../../shared/models/order-status';
import { ShippingStatus } from '../../../shared/models/shipping-status';

export interface BriefOrderResponse {
  orderId: string;
  orderType: OrderType;
  status: OrderStatus;
  shippingStatus?: ShippingStatus;
  createdAt: string;
  noOfItems: number;
  totalPrice: number;
}
