import { Category } from './category';

export type ProductStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface Product {
  id: string;
  sellerId: string;
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
}
