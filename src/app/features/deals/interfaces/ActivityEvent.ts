export interface ActivityEvent {
  userId: string;
  type: 'JOINED' | 'LEFT';
  timestamp: string;
}
