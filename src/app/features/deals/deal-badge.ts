import { DealBadge, DealView } from '../../shared/models/deal';

const ENDING_SOON_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export function dealBadge(deal: DealView): DealBadge {
  if (!deal.endTime) {
    return deal.badge;
  }
  const remainingMs = new Date(deal.endTime).getTime() - Date.now();
  if (remainingMs < ENDING_SOON_THRESHOLD_MS) {
    return {
      icon: 'timer',
      text: 'Ending Soon',
      bgClass: 'bg-error-container/90',
      textClass: 'text-on-error-container',
    };
  }
  return deal.badge;
}
