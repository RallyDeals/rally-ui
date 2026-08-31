import { DealOverview } from './interfaces/deal-overview';
import { DealStatus } from '../../shared/models/deal';
import { resolveImageUrl } from '../../shared/utils/image-url';

export interface DealResponse {
  id: string;
  productId: string;
  sellerId: string;
  originalPrice: number;
  dealPrice: number;
  dealStock: number;
  currentParticipants: number;
  authorizedCount: number;
  minParticipants: number;
  status: string;
  startTime: string | null;
  durationMinutes: number;
  endTime: string | null;
  timeRemainingSeconds: number | null;
  createdAt: string;
  productName: string | null;
  productImageUrl: string | null;
  category: string | null;
  sku: string | null;
  sellerName: string | null;
}

export function toDealOverview(res: DealResponse): DealOverview {
  const neededCount = Math.max(0, res.minParticipants - res.currentParticipants);
  const progressPercent = res.dealStock > 0
    ? Math.min(100, Math.round((res.currentParticipants / res.dealStock) * 100))
    : 0;
  return {
    id: res.id,
    productId: res.productId,
    productName: res.productName ?? 'Unknown Product',
    productImageUrl: resolveImageUrl(res.productImageUrl),
    category: res.category ?? 'Uncategorized',
    sku: res.sku ?? '',
    sellerId: res.sellerId,
    sellerName: res.sellerName ?? '',
    originalPrice: res.originalPrice,
    dealPrice: res.dealPrice,
    dealStock: res.dealStock,
    currentParticipants: res.currentParticipants,
    authorizedCount: res.authorizedCount,
    neededCount,
    progressPercent,
    minParticipants: res.minParticipants,
    status: res.status.toLowerCase() as DealStatus,
    durationMinutes: res.durationMinutes,
    endTime: res.endTime ? new Date(res.endTime) : new Date(),
  };
}
