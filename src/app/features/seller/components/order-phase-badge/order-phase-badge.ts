import { Component, input } from '@angular/core';
import { OrderStatus } from '../../../../shared/models/order-status';
import { ShippingStatus } from '../../../../shared/models/shipping-status';
import { OrderStatusBadge } from '../../../../shared/components/order-status-badge/order-status-badge';
import { ShippingStatusBadge } from '../../../../shared/components/shipping-status-badge/shipping-status-badge';

@Component({
  selector: 'app-order-phase-badge',
  imports: [OrderStatusBadge, ShippingStatusBadge],
  templateUrl: './order-phase-badge.html',
})
export class OrderPhaseBadge {
  status = input.required<OrderStatus>();
  shippingStatus = input<ShippingStatus | null>(null);
}
