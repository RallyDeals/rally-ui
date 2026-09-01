export interface UpsertProductRequest {
  name: string;
  description: string;
  categoryId?: string;
  basePrice: number;
  sku?: string;
  visible?: boolean;
  tags?: string[];
  imageUrl?: string;
  images?: string[];
  initialStock?: number;
}
