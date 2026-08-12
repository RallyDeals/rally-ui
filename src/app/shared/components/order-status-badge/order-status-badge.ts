import { Component, computed, input } from '@angular/core';
import { OrderStatus } from '../../models/order-status';

interface OrderStatusMeta {
  label: string;
  icon: string;
  badgeClass: string;
}

const PENDING_BADGE_CLASS = 'bg-surface-container-high text-on-surface-variant';

const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  RESERVING: {
    label: 'Reserving',
    icon: 'hourglass_top',
    badgeClass: PENDING_BADGE_CLASS,
  },
  PENDING_CHARGE: {
    label: 'Pending Charge',
    icon: 'hourglass_top',
    badgeClass: PENDING_BADGE_CLASS,
  },
  PENDING_AUTHORIZATION: {
    label: 'Pending Authorization',
    icon: 'hourglass_top',
    badgeClass: PENDING_BADGE_CLASS,
  },
  AUTHORIZED: {
    label: 'Authorized',
    icon: 'verified',
    badgeClass: PENDING_BADGE_CLASS,
  },
  PENDING_CAPTURE: {
    label: 'Pending Capture',
    icon: 'hourglass_top',
    badgeClass: PENDING_BADGE_CLASS,
  },
  PENDING_VOID: {
    label: 'Pending Void',
    icon: 'hourglass_top',
    badgeClass: PENDING_BADGE_CLASS,
  },
  CONFIRMED: {
    label: 'Confirmed',
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
  selector: 'app-order-status-badge',
  imports: [],
  templateUrl: './order-status-badge.html',
})
export class OrderStatusBadge {
  status = input.required<OrderStatus>();

  meta = computed(() => ORDER_STATUS_META[this.status()]);
}
