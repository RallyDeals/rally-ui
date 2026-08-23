export interface ActivityEvent {
  userId: string;
  type: 'JOINED' | 'LEFT' | 'PENDING';
  timestamp: string;
}
