import { Component, input } from '@angular/core';

export type DealStatus = 'active' | 'completed' | 'scheduled' | 'expired';

const PILL_CLASSES: Record<DealStatus, string> = {
  active: 'bg-surface-container-highest text-primary',
  completed: 'bg-secondary-container text-on-secondary-container',
  scheduled: 'bg-surface-container text-on-surface-variant',
  expired: 'bg-error-container text-on-error-container',
};

const DOT_CLASSES: Record<DealStatus, string> = {
  active: 'bg-primary',
  completed: 'bg-secondary',
  scheduled: 'bg-outline',
  expired: 'bg-error',
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
