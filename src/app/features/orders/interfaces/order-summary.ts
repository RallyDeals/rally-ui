export interface OrderSummary {
  subtotal: number;
  shippingLabel: string;
  shippingCost: number;
  estimatedTaxes: number;
  total: number;
  totalNote: string;
}
