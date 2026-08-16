import { Category } from './category';
import { Product } from './product';

export type DealStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED';

export const DealStatusLabels: Record<DealStatus, string> = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  SUCCEEDED: 'Succeeded',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

export const DealStatusDisplay: Record<DealStatus, { label: string; description: string }> = {
  PENDING: { label: 'Pending', description: 'Created. Becomes active automatically once the first buyer joins.' },
  ACTIVE: { label: 'Active', description: 'Live — buyers can join. Ends when the stock sells out or time runs out.' },
  SUCCEEDED: { label: 'Succeeded', description: 'Deal stock was sold. Buyers are being fulfilled at the deal price.' },
  FAILED: { label: 'Failed', description: 'Ended before reaching the minimum participants. Buyers were not charged.' },
  CANCELLED: { label: 'Cancelled', description: 'Cancelled before it started. Only possible while no one has joined yet.' },
};

export interface DealBadge {
  icon: string;
  text: string;
  bgClass: string;
  textClass: string;
}

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