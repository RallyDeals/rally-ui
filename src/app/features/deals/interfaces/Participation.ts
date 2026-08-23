export type ParticipationStatus = 'pending' | 'active' | 'declined' | 'left';

export interface Participation {
  id: string;
  dealId: string;
  userId: string;
  referredBy: string | null;
  status: ParticipationStatus;
  joinedAt: string;
  leftAt: string | null;
}
