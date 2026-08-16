export interface Inventory {
  productId: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  version: number;
  updatedAt: string;
}
