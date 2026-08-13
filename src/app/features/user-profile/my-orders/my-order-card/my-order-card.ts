import { Component, computed, input } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BriefOrderResponse } from '../../../orders/interfaces/brief-order-response';
import { ORDER_TYPE_LABELS } from '../../../../shared/models/order-type';
import { ShippingStatusBadge } from '../../../../shared/components/shipping-status-badge/shipping-status-badge';
import { OrderStatusBadge } from '../../../../shared/components/order-status-badge/order-status-badge';

@Component({
  selector: 'app-my-order-card',
  imports: [NgClass, RouterLink, DatePipe, CurrencyPipe, ShippingStatusBadge, OrderStatusBadge],
  templateUrl: './my-order-card.html',
})
export class MyOrderCard {
  order = input.required<BriefOrderResponse>();

  orderIdLabel = computed(() => this.order().orderId.slice(0, 8));
  orderTypeLabel = computed(() => ORDER_TYPE_LABELS[this.order().orderType]);
  itemsLabel = computed(() => {
    const count = this.order().noOfItems;
    return `${count} ${count === 1 ? 'Item' : 'Items'}`;
  });
  isMuted = computed(() => this.order().status === 'CANCELLED');
}
