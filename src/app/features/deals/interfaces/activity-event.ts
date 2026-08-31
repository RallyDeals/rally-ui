export interface ActivityEvent {
  userId: string;
  type: 'JOINED' | 'LEFT' | 'PENDING' | 'DECLINED';
  timestamp: string;
}
