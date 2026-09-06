import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { DealStatus } from '../../../../shared/models/deal';
import { DealOverview } from '../../../deals/interfaces/deal-overview';
import { DealProgress, ProgressTone } from '../../../seller/components/deal-progress/deal-progress';
import { Countdown } from '../../../../shared/components/countdown/countdown';
import { formatDuration } from '../../../../shared/utils/date-format.util';

interface StatusBadge {
  label: string;
  bgClass: string;
  textClass: string;
  dotClass: string | null;
}

const STATUS_BADGES: Record<DealStatus, StatusBadge> = {
  [DealStatus.ACTIVE]: {
    label: 'ACTIVE',
    bgClass: 'bg-primary-container/10',
    textClass: 'text-primary-container',
    dotClass: 'bg-primary-container',
  },
  [DealStatus.SUCCEEDED]: { label: 'SUCCEEDED', bgClass: 'bg-secondary-container/20', textClass: 'text-secondary', dotClass: null },
  [DealStatus.FAILED]: { label: 'FAILED', bgClass: 'bg-error-container/30', textClass: 'text-error', dotClass: null },
  [DealStatus.PENDING]: {
    label: 'PENDING',
    bgClass: 'bg-surface-container-high/60',
    textClass: 'text-on-surface-variant',
    dotClass: null,
  },
  [DealStatus.CANCELLED]: { label: 'CANCELLED', bgClass: 'bg-outline-variant/30', textClass: 'text-on-surface-variant', dotClass: null },
};

const PROGRESS_TONES: Record<DealStatus, ProgressTone> = {
  [DealStatus.PENDING]: 'neutral',
  [DealStatus.ACTIVE]: 'primary',
  [DealStatus.SUCCEEDED]: 'secondary',
  [DealStatus.FAILED]: 'error',
  [DealStatus.CANCELLED]: 'neutral',
};

const TIME_LABELS: Record<DealStatus, string> = {
  [DealStatus.PENDING]: 'Awaiting first participant',
  [DealStatus.ACTIVE]: '',
  [DealStatus.SUCCEEDED]: 'Ended',
  [DealStatus.FAILED]: 'Failed',
  [DealStatus.CANCELLED]: 'Cancelled',
};

@Component({
  selector: 'tr[app-deal-row]',
  imports: [CurrencyPipe, DealProgress, Countdown],
  templateUrl: './deal-row.html',
})
export class DealRow {
  deal = input.required<DealOverview>();

  readonly DealStatus = DealStatus;
  readonly badge = computed(() => STATUS_BADGES[this.deal().status]);
  readonly progressTone = computed(() => PROGRESS_TONES[this.deal().status]);
  readonly timeLabel = computed(() => TIME_LABELS[this.deal().status]);
  protected readonly formatDuration = formatDuration;
}
