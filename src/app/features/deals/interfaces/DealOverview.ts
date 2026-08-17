import { Deal } from '../../../shared/models/deal';

export interface DealOverview extends Deal {
  productId: string;
  productName: string;
  productImageUrl: string;
  category: string;
  sku: string;
  sellerName: string;
  sellerId: string;
}



