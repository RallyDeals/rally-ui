import { Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { MyOrder } from '../../interfaces/my-order';
import { ORDER_TYPE_LABELS } from '../../../../shared/models/order-type';
import { ShippingStatusBadge } from '../../../../shared/components/shipping-status-badge/shipping-status-badge';
import { OrderStatusBadge } from '../../../../shared/components/order-status-badge/order-status-badge';

@Component({
  selector: 'app-my-order-card',
  imports: [NgClass, ShippingStatusBadge, OrderStatusBadge],
  templateUrl: './my-order-card.html',
})
export class MyOrderCard {
  order = input.required<MyOrder>();

  orderTypeLabel = computed(() => ORDER_TYPE_LABELS[this.order().orderType]);
}
