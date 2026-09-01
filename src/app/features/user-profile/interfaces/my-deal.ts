export interface MyDeal {
  id: string;
  image: string;
  imageAlt: string;
  title: string;
  statusLabel: string;
  statusBadgeClass: string;
  timeLabel: string;
  timeIcon: string;
  timeTextClass: string;
  price: number;
  originalPrice: number;
  joined: number;
  totalSpots: number;
  progressPercent: number;
  /** Completed deals were fulfilled as an order, so they link to order details instead of being shareable. */
  isCompleted: boolean;
}
