export interface CheckoutOrderItem {
  productId: string;
  quantity: number;
}

export interface CheckoutOrderRequest {
  orderItems: CheckoutOrderItem[];
  paymentMethodId: string;
  address: string;
}
