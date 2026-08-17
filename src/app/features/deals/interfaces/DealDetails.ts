import { Deal } from '../../../shared/models/deal';

export interface DealDetails extends Deal {
  productId: string;
  productName: string;
  productImageUrl: string;
  category: string;
  sku: string;
  sellerName: string;
  sellerId: string;
  productDescription: string;
  productImages: Array<string>;
}
