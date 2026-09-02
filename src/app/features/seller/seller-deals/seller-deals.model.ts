import { FilterPillOption } from '../../../shared/components/filter-pills/filter-pills';
import { ProgressTone } from '../components/deal-progress/deal-progress';
import { DealStatus } from '../../../shared/models/deal';
import { DealOverview } from '../../deals/interfaces/deal-overview';
import { timeRemainingInSeconds } from '../../../shared/utils/deal-time.util';
import { dealCode } from '../../../shared/utils/order-code.util';

export interface DealRow {
  id: string;
  code: string;
  name: string;
  image: string;
  status: DealStatus;
  currentParticipants: number;
  dealStock: number;
  minParticipants: number;
  endTime: string | null;
  dealPrice: number;
  originalPrice: number;
  time: string;
  urgent: boolean;
}

export type StatusFilter = 'ALL' | DealStatus;

export const DEAL_STATUS_OPTIONS: FilterPillOption[] = [
  { value: 'ALL', label: 'All' },
  { value: DealStatus.ACTIVE, label: 'Active' },
  { value: DealStatus.PENDING, label: 'Pending' },
  { value: DealStatus.SUCCEEDED, label: 'Succeeded' },
  { value: DealStatus.FAILED, label: 'Failed' },
  { value: DealStatus.CANCELLED, label: 'Cancelled' },
];

export const PROGRESS_TONES: Record<DealStatus, ProgressTone> = {
  [DealStatus.PENDING]: 'neutral',
  [DealStatus.ACTIVE]: 'primary',
  [DealStatus.SUCCEEDED]: 'secondary',
  [DealStatus.FAILED]: 'error',
  [DealStatus.CANCELLED]: 'neutral',
};

const STATUSES_WITH_END_TIME = new Set<DealStatus>([DealStatus.ACTIVE]);

// Exported so the component can re-format this every second for a live tick;
// the seconds value itself always comes from the backend, never from a local Date diff.
export function formatCountdown(timeRemainingInSeconds: number): string {
  const seconds = Math.max(0, Math.floor(timeRemainingInSeconds));
  if (seconds === 0) {
    return 'Ended';
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (h > 99) {
    return `${Math.floor(h / 24)}d ${pad(h % 24)}h`;
  }
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function timeLabel(deal: DealOverview): string {
  switch (deal.status) {
    case DealStatus.ACTIVE:
      // Superseded in the template by a live per-second countdown ticking off endTime.
      return '';
    case DealStatus.PENDING:
      return 'Awaiting first participant';
    case DealStatus.SUCCEEDED:
      return 'Ended';
    case DealStatus.FAILED:
      return 'Failed';
    case DealStatus.CANCELLED:
      return 'Cancelled';
  }
}

function urgentLabel(deal: DealOverview): boolean {
  const seconds = timeRemainingInSeconds(deal.endTime);
  return deal.status === DealStatus.ACTIVE && seconds > 0 && seconds < 6 * 3600;
}

export function toDealRow(deal: DealOverview): DealRow {
  return {
    id: deal.id,
    code: dealCode(deal.id),
    name: deal.productName,
    image: deal.productImageUrl,
    status: deal.status,
    currentParticipants: deal.currentParticipants,
    dealStock: deal.dealStock,
    minParticipants: deal.minParticipants,
    endTime: STATUSES_WITH_END_TIME.has(deal.status) ? deal.endTime.toISOString() : null,
    dealPrice: deal.dealPrice,
    originalPrice: deal.originalPrice,
    time: timeLabel(deal),
    urgent: urgentLabel(deal),
  };
}
