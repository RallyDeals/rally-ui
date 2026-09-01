export interface Seller {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  joinedAt: string;
  totalProducts: number;
  totalPendingProducts: number;
  activeDeals: number;
}
