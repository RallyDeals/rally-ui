export function orderCode(id: string): string {
  return `ORD-${id.slice(-5).toUpperCase()}`;
}

export function productCode(productId: string): string {
  return `PRD-${productId.slice(-5).toUpperCase()}`;
}
