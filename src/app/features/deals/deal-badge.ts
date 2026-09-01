import { DealStatus } from '../../shared/models/deal';
import { DealOverview } from './interfaces/deal-overview';
import { timeRemainingInSeconds } from '../../shared/utils/deal-time.util';

const ENDING_SOON_THRESHOLD_SECONDS = 6 * 60 * 60;

export interface DealBadge {
  icon: string;
  text: string;
  bgClass: string;
  textClass: string;
}

export function dealBadge(deal: DealOverview): DealBadge {
  switch (deal.status) {
    case DealStatus.SUCCEEDED:
      return {
        icon: 'task_alt',
        text: 'Succeeded',
        bgClass: 'bg-secondary-container/30',
        textClass: 'text-on-secondary-container',
      };
    case DealStatus.FAILED:
      return {
        icon: 'error',
        text: 'Failed',
        bgClass: 'bg-error-container/30',
        textClass: 'text-on-error-container',
      };
    case DealStatus.CANCELLED:
      return {
        icon: 'cancel',
        text: 'Cancelled',
        bgClass: 'bg-error-container/30',
        textClass: 'text-on-error-container',
      };
    case DealStatus.PENDING:
      return {
        icon: 'groups',
        text: 'Gathering',
        bgClass: 'bg-surface-container-high/60',
        textClass: 'text-on-surface-variant',
      };
    default:
      if (timeRemainingInSeconds(deal.endTime) <= ENDING_SOON_THRESHOLD_SECONDS) {
        return {
          icon: 'timer',
          text: 'Ending Soon',
          bgClass: 'bg-error-container/90',
          textClass: 'text-on-error-container',
        };
      }
      return {
        icon: 'local_fire_department',
        text: 'High Demand',
        bgClass: 'bg-error-container/30',
        textClass: 'text-on-error-container',
      };
  }
}
