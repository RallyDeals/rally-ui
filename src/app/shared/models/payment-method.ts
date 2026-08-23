export interface PaymentMethod {
  id: string;
  userId: string,
  cardFingerprint: string;
  type: 'CARD' | 'WALLET';
  cardBrand: string;
  cardLast4: string;
  cardExpMonth: string;
  cardExpYear: string;
  isDefault: boolean;
}
export interface PaymentMethodListResponse{
  items: PaymentMethod[]
}
export interface CreatePaymentMethodRequest {
  paymentMethodId: string;
  isDefault: boolean;
}
export interface SetupIntentResponse {
  setupIntentId: string;
  clientSecret: string;
  requiresAction: boolean;
}
