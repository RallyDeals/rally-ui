import { Inventory } from '../models/inventory';

const DEFAULT_TOTAL_STOCK = 50;

const store = new Map<string, Inventory>();

function seedInventory(productId: string): Inventory {
  return {
    productId,
    totalStock: DEFAULT_TOTAL_STOCK,
    reservedStock: 0,
    availableStock: DEFAULT_TOTAL_STOCK,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
}

export function getMockInventory(productId: string): Inventory {
  let inventory = store.get(productId);
  if (!inventory) {
    inventory = seedInventory(productId);
    store.set(productId, inventory);
  }
  return inventory;
}

export function setMockInventory(productId: string, changes: Partial<Pick<Inventory, 'totalStock' | 'reservedStock'>>): Inventory {
  const current = getMockInventory(productId);
  const totalStock = Math.max(0, changes.totalStock ?? current.totalStock);
  const reservedStock = Math.max(0, changes.reservedStock ?? current.reservedStock);
  const updated: Inventory = {
    productId,
    totalStock,
    reservedStock,
    availableStock: Math.max(0, totalStock - reservedStock),
    version: current.version + 1,
    updatedAt: new Date().toISOString(),
  };
  store.set(productId, updated);
  return updated;
}

export function deleteMockInventory(productId: string): void {
  store.delete(productId);
}
