import { Component, computed, input } from '@angular/core';
import { OrderItemRow } from './order-item-row/order-item-row';
import { OrderItem } from '../../interfaces/order-item';

@Component({
  selector: 'app-order-items-list',
  imports: [OrderItemRow],
  templateUrl: './order-items-list.html',
})
export class OrderItemsList {
  items = input.required<OrderItem[]>();

  itemCount = computed(() => this.items().length);
}
