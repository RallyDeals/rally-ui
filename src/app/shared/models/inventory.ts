export interface Inventory {
  productId: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  version: number;
  updatedAt: string;
}

export interface PublicStockStatus {
  productId: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  displayQuantity?: number;
}
