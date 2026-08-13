import { Component, computed, input } from '@angular/core';
import { ShippingStatus } from '../../models/shipping-status';

interface ShippingStatusMeta {
  label: string;
  icon: string;
  badgeClass: string;
}

const SHIPPING_STATUS_META: Record<ShippingStatus, ShippingStatusMeta> = {
  PROCESSING: {
    label: 'Processing',
    icon: 'sync',
    badgeClass: 'bg-surface-container-high text-on-surface-variant',
  },
  SHIPPED: {
    label: 'Shipped',
    icon: 'local_shipping',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
  },
  DELIVERED: {
    label: 'Delivered',
    icon: 'check_circle',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
  },
};

@Component({
  selector: 'app-shipping-status-badge',
  imports: [],
  templateUrl: './shipping-status-badge.html',
})
export class ShippingStatusBadge {
  status = input.required<ShippingStatus>();

  meta = computed(() => SHIPPING_STATUS_META[this.status()]);
}
