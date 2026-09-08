export enum DealStatus {
  PENDING= 'PENDING',
  ACTIVE= 'ACTIVE',
  SUCCEEDED= 'SUCCEEDED',
  FAILED= 'FAILED',
  CANCELLED= 'CANCELLED'
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
