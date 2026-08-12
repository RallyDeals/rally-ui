import { Product } from '../../../shared/models/product';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface ProductRow extends Product {
  sku: string;
  stockStatus: StockStatus;
  groupPrice: number;
}

const STOCK_STATUSES: StockStatus[] = ['IN_STOCK', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'];

function hash(value: string): number {
  let total = 0;
  for (let index = 0; index < value.length; index++) {
    total = (total + value.charCodeAt(index)) % 997;
  }
  return total;
}

export function toProductRow(product: Product): ProductRow {
  return {
    ...product,
    sku: `SKU-${product.id.slice(0, 8).toUpperCase()}`,
    stockStatus: STOCK_STATUSES[hash(product.id) % STOCK_STATUSES.length],
    groupPrice: Math.round(product.basePrice * 0.83 * 100) / 100,
  };
}
