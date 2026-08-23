export enum DealStatus {
  PENDING= 'pending',
  ACTIVE= 'active',
  SUCCEEDED= 'succeeded',
  FAILED= 'failed',
  CANCELLED= 'cancelled'
}
export interface Deal {
  id: string;
  minParticipants: number;
  dealStock: number;
  originalPrice: number;
  dealPrice: number;
  currentParticipants: number;
  authorizedCount: number;
  neededCount: number;
  progressPercent: number;
  status: DealStatus;
  durationMinutes: number;
  endTime: Date;
}
