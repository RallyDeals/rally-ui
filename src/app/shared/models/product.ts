import { Category } from './category';

export type ProductStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface ActiveDeal {
  dealId: string;
  dealPrice: number;
  dealStock: number;
  currentParticipants: number;
  minParticipants: number;
  status: string;
  endTime: string | null;
  durationMinutes: number;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  description: string;
  category: Category;
  basePrice: number;
  sku: string | null;
  visible: boolean;
  tags: string[];
  imageUrl: string | null;
  images?: string[];
  status: ProductStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  deletedAt: string | null;
  availableStock?: number;
  activeDeals?: ActiveDeal[];
}
