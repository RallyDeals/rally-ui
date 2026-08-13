import { OrderStatus } from '../../../shared/models/order-status';
import { OrderType } from '../../../shared/models/order-type';
import { ShippingStatus } from '../../../shared/models/shipping-status';

export interface MyOrder {
  id: string;
  datePlaced: string;
  total: string;
  itemsLabel: string;
  orderType: OrderType;
  orderStatus: OrderStatus;
  /** Absent until the order is confirmed and fulfillment has started — takes precedence over orderStatus when set. */
  shippingStatus?: ShippingStatus;
  isMuted: boolean;
}
