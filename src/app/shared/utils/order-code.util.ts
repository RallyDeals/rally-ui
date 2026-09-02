export function orderCode(id: string): string {
  return `ORD-${id.slice(-5).toUpperCase()}`;
}

export function productCode(productId: string): string {
  return `PRD-${productId.slice(-5).toUpperCase()}`;
}

export function dealCode(dealId: string): string {
  return `GD-${dealId.slice(-4).toUpperCase()}`;
}
