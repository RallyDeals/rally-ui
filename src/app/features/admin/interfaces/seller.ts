export interface Seller {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  joinedAt: string;
  productsCount: number;
  pendingApprovals: number;
  activeDeals: number;
}
