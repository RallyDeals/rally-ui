import { Component, input } from '@angular/core';
import { DealStatus } from '../../../../shared/models/deal';

export type { DealStatus };

const PILL_CLASSES: Record<DealStatus, string> = {
  PENDING: 'bg-surface-container text-on-surface-variant',
  ACTIVE: 'bg-surface-container-highest text-primary',
  SUCCEEDED: 'bg-secondary-container text-on-secondary-container',
  FAILED: 'bg-error-container text-on-error-container',
  CANCELLED: 'bg-surface-container-high text-on-surface-variant',
};

const DOT_CLASSES: Record<DealStatus, string> = {
  PENDING: 'bg-outline',
  ACTIVE: 'bg-primary',
  SUCCEEDED: 'bg-secondary',
  FAILED: 'bg-error',
  CANCELLED: 'bg-outline-variant',
};

@Component({
  selector: 'app-deal-status-badge',
  imports: [],
  templateUrl: './deal-status-badge.html',
})
export class DealStatusBadge {
  status = input.required<DealStatus>();
  label = input('');

  get displayLabel(): string {
    return this.label() || this.status();
  }

  pillClass(): string {
    return PILL_CLASSES[this.status()];
  }

  dotClass(): string {
    return DOT_CLASSES[this.status()];
  }
}