import { Product } from '../../../shared/models/product';
import { Inventory } from '../../../shared/models/inventory';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface ProductRow extends Product {
  sku: string;
  stockStatus: StockStatus;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  groupPrice: number;
}

const LOW_STOCK_THRESHOLD = 10;

export function deriveStockStatus(inventory: Inventory): StockStatus {
  if (inventory.availableStock <= 0) return 'OUT_OF_STOCK';
  if (inventory.availableStock <= LOW_STOCK_THRESHOLD) return 'LOW_STOCK';
  return 'IN_STOCK';
}

export function toProductRow(product: Product, inventory?: Inventory): ProductRow {
  const totalStock = inventory?.totalStock ?? 0;
  const reservedStock = inventory?.reservedStock ?? 0;
  const availableStock = inventory?.availableStock ?? 0;
  return {
    ...product,
    sku: product.sku ?? `SKU-${product.id.slice(0, 8).toUpperCase()}`,
    stockStatus: inventory ? deriveStockStatus(inventory) : 'OUT_OF_STOCK',
    totalStock,
    reservedStock,
    availableStock,
    groupPrice: Math.round(product.basePrice * 0.83 * 100) / 100,
  };
}
