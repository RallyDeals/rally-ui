import { Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { SellerOrderPhase } from '../../../../shared/models/seller-order';
import { ShippingStatusBadge } from '../../../../shared/components/shipping-status-badge/shipping-status-badge';

interface PhaseMeta {
  label: string;
  icon: string;
  badgeClass: string;
}

const PHASE_META: Record<SellerOrderPhase, PhaseMeta> = {
  PENDING: {
    label: 'Pending',
    icon: 'hourglass_top',
    badgeClass: 'bg-surface-container-high text-on-surface-variant',
  },
  PROCESSING: {
    label: 'Processing',
    icon: 'sync',
    badgeClass: 'bg-surface-container-high text-on-surface-variant',
  },
  SHIPPING: {
    label: 'Shipping',
    icon: 'local_shipping',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
  },
  DELIVERED: {
    label: 'Delivered',
    icon: 'check_circle',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: 'cancel',
    badgeClass: 'bg-error-container text-on-error-container',
  },
};

@Component({
  selector: 'app-order-phase-badge',
  imports: [NgClass],
  template: `
    <span
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold"
      [ngClass]="meta().badgeClass"
    >
      <span class="material-symbols-outlined text-xs">{{ meta().icon }}</span>
      {{ meta().label }}
    </span>
  `,
})
export class OrderPhaseBadge {
  phase = input.required<SellerOrderPhase>();

  meta = computed(() => PHASE_META[this.phase()]);
}
