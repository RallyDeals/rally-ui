import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { DealStatus } from '../../../../shared/models/deal';
import { DealOverview } from '../../../deals/interfaces/DealOverview';

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

@Component({
  selector: 'tr[app-deal-row]',
  imports: [CurrencyPipe],
  templateUrl: './deal-row.html',
})
export class DealRow {
  deal = input.required<DealOverview>();

  readonly badge = computed(() => STATUS_BADGES[this.deal().status]);
}
