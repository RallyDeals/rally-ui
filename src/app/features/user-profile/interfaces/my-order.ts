export interface MyOrder {
  id: string;
  datePlaced: string;
  total: string;
  itemsLabel: string;
  shippingAddress: string;
  statusLabel: string;
  statusIcon?: string;
  statusDotClass: string;
  statusBadgeClass: string;
  /** Older, fully-settled orders render slightly muted (opacity) to de-emphasize them. */
  isMuted: boolean;
}
