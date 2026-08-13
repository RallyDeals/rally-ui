import { OrderStatus } from '../../../shared/models/order-status';
import { OrderType } from '../../../shared/models/order-type';
import { ShippingStatus } from '../../../shared/models/shipping-status';
import { OrderItem } from './order-item';
import { CancelReason } from './cancel-reason';

export interface DetailedOrderResponse {
  orderId: string;
  userId: string;
  orderType: OrderType;
  dealId: string;
  participantId: string;
  status: OrderStatus;
  shippingStatus: ShippingStatus;
  cancelReason: CancelReason;
  paymentErrorCode: string;
  paymentErrorMessage: string;
  totalPrice: number;
  address: string;
  paymentId: string;
  cardLast4: string;
  cardBrand: string;
  cardExpMonth: string;
  cardExpYear: string;
  orderProducts: OrderItem[];
  createdAt: string;
  updatedAt: string;
  statusUpdatedAt: string;
}
