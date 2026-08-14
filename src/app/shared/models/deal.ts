import { Category } from './category';
import { Product } from './product';

export type DealStatus = 'pending' | 'active' | 'succeeded' | 'failed' | 'cancelled';

export interface DealBadge {
  icon: string;
  text: string;
  bgClass: string;
  textClass: string;
}

/** Mirrors the DealService DealResponse contract (deal-service.md §5.2). */
export interface Deal {
  id: string;
  productId: string;
  sellerId: string;
  originalPrice: number;
  dealPrice: number;
  dealStock: number;
  currentParticipants: number;
  authorizedCount: number;
  minParticipants: number;
  status: DealStatus;
  startTime: string | null;
  durationMinutes: number;
  endTime: string | null;
  timeRemainingSeconds: number | null;
  createdAt: string;
}

/** Deal enriched with catalog product presentation data (not part of the API). */
export interface DealView extends Deal {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  badge: DealBadge;
  category?: Category | null;
  images?: string[];
  product?: Product;
}

export function neededCount(deal: Pick<Deal, 'minParticipants' | 'currentParticipants'>): number {
  return Math.max(0, deal.minParticipants - deal.currentParticipants);
}

export function progressPercent(deal: Pick<Deal, 'dealStock' | 'currentParticipants'>): number {
  if (deal.dealStock <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((deal.currentParticipants / deal.dealStock) * 100));
}
