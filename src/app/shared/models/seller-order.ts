import { OrderType } from './order-type';
import { OrderStatus } from './order-status';
import { ShippingStatus } from './shipping-status';

/** One line item on a seller order, mirroring the Order Service's OrderItem shape. */
export interface SellerOrderItem {
  productId: string;
  productImageUrl: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

/**
 * High-level fulfillment phase a seller cares about. Collapses the granular
 * payment lifecycle (OrderStatus) and the shipping lifecycle (ShippingStatus)
 * into the five buckets surfaced on the seller Orders dashboard.
 */
export type SellerOrderPhase =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

/** Seller-facing view of an order. Not part of any service API contract yet. */
export interface SellerOrder {
  id: string;
  orderType: OrderType;
  status: OrderStatus;
  shippingStatus: ShippingStatus | null;
  phase: SellerOrderPhase;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  items: SellerOrderItem[];
  totalPrice: number;
}

export function toSellerOrderPhase(
  status: OrderStatus,
  shippingStatus: ShippingStatus | null,
): SellerOrderPhase {
  if (status === 'CANCELLED') {
    return 'CANCELLED';
  }
  switch (shippingStatus) {
    case 'DELIVERED':
      return 'DELIVERED';
    case 'SHIPPING':
      return 'SHIPPING';
    case 'PROCESSING':
      return 'PROCESSING';
    default:
      return 'PENDING';
  }
}
