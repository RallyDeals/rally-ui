import { CancelReason } from './cancel-reason';
import { OrderStatus } from '../../../shared/models/order-status';
import { ShippingStatus } from '../../../shared/models/shipping-status';

export interface OrderHeaderInfo {
  deliveryType: string;
  placedDateLabel: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  shippingStatus?: ShippingStatus;
  cancelReason?: CancelReason;
  paymentErrorMessage?: string;
}
