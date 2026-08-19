import { CancelReason } from '../../../shared/models/cancel-reason';
import { OrderStatus } from '../../../shared/models/order-status';
import { ShippingStatus } from '../../../shared/models/shipping-status';

export interface OrderHeaderInfo {
  deliveryType: string;
  placedDate: string;
  orderNumber: string;
  dealNumber: string;
  orderStatus: OrderStatus;
  shippingStatus?: ShippingStatus;
  cancelReason?: CancelReason;
  paymentErrorMessage?: string;
}
