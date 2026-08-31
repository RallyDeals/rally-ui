export interface CreateDealRequest {
  productId: string;
  dealPrice: number;
  dealStock: number;
  minParticipants: number;
  durationMinutes: number;
}
