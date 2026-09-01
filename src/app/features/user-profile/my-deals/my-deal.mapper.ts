import { DealStatus } from '../../../shared/models/deal';
import { DealOverview } from '../../deals/interfaces/deal-overview';
import { dealBadge } from '../../deals/deal-badge';
import { MyDeal } from '../interfaces/my-deal';
import { timeRemainingInSeconds } from '../../../shared/utils/deal-time.util';

const URGENT_THRESHOLD_SECONDS = 6 * 60 * 60;

function timeInfo(deal: DealOverview): { label: string; icon: string; textClass: string } {
  if (deal.status !== DealStatus.ACTIVE) {
    return {
      label: deal.status === DealStatus.PENDING ? 'Not started' : 'Ended',
      icon: 'check_circle',
      textClass: 'text-on-surface-variant',
    };
  }
  const seconds = timeRemainingInSeconds(deal.endTime);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds / 3600);
  const label = days > 0 ? `${days}d left` : hours > 0 ? `${hours}h left` : `${Math.ceil(seconds / 60)}m left`;
  return {
    label,
    icon: 'timer',
    textClass: seconds < URGENT_THRESHOLD_SECONDS ? 'text-primary' : 'text-on-surface',
  };
}

export function toMyDeal(deal: DealOverview): MyDeal {
  const badge = dealBadge(deal);
  const time = timeInfo(deal);
  return {
    id: deal.id,
    image: deal.productImageUrl,
    imageAlt: deal.productName,
    title: deal.productName,
    statusLabel: badge.text,
    statusBadgeClass: `${badge.bgClass} ${badge.textClass}`,
    timeLabel: time.label,
    timeIcon: time.icon,
    timeTextClass: time.textClass,
    price: deal.dealPrice,
    originalPrice: deal.originalPrice,
    joined: deal.currentParticipants,
    totalSpots: deal.dealStock,
    progressPercent: deal.progressPercent,
    isCompleted: deal.status !== DealStatus.ACTIVE && deal.status !== DealStatus.PENDING,
  };
}
