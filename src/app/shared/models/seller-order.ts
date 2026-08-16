import { OrderType } from './order-type';
import { OrderStatus } from './order-status';
import { ShippingStatus } from './shipping-status';

/** One line item on a seller order, mirroring the Order Service's BriefSellerOrderItemResponse. */
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
 *
 * This maps 1:1 to the backend's CompactedOrderStatus enum.
 */
export type SellerOrderPhase =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

/** Seller-facing view of an order from the brief list endpoint. */
export interface SellerOrder {
  id: string;
  phase: SellerOrderPhase;
  createdAt: string;
  items: SellerOrderItem[];
  totalPrice: number;
}

/** Seller-facing detailed view of a single order. */
export interface SellerOrderDetail {
  id: string;
  phase: SellerOrderPhase;
  cancelReason: string | null;
  address: string | null;
  createdAt: string;
  items: SellerOrderItem[];
  totalPrice: number;
}

/** Backend response shape: BriefSellerOrderPageResponse */
export interface SellerOrderPageResponse {
  orders: BackendSellerOrder[];
  page: number;
  limit: number;
  total: number;
}

/** Backend response shape: BriefSellerOrderResponse */
export interface BackendSellerOrder {
  orderId: string;
  status: SellerOrderPhase;
  createdAt: string;
  items: SellerOrderItem[];
}

/** Backend response shape: DetailedSellerOrderResponse */
export interface BackendSellerOrderDetail {
  orderId: string;
  status: SellerOrderPhase;
  cancelReason: string | null;
  address: string | null;
  createdAt: string;
  items: SellerOrderItem[];
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

export function computeTotalPrice(items: SellerOrderItem[]): number {
  return Math.round(
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) * 100,
  ) / 100;
}

export function mapBackendOrder(backend: BackendSellerOrder): SellerOrder {
  return {
    id: backend.orderId,
    phase: backend.status,
    createdAt: backend.createdAt,
    items: backend.items,
    totalPrice: computeTotalPrice(backend.items),
  };
}

export function mapBackendOrderDetail(backend: BackendSellerOrderDetail): SellerOrderDetail {
  return {
    id: backend.orderId,
    phase: backend.status,
    cancelReason: backend.cancelReason,
    address: backend.address,
    createdAt: backend.createdAt,
    items: backend.items,
    totalPrice: computeTotalPrice(backend.items),
  };
}
