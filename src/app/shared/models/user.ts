export type BuyerStatus = 'active' | 'banned';
export type UserType = 'buyer' | 'seller';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: BuyerStatus;
  type: UserType;
  joinedAt: string;
}
