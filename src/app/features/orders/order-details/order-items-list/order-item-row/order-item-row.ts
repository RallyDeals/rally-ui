import { Component, input } from '@angular/core';
import { OrderItem } from '../../../interfaces/order-item';

@Component({
  selector: 'app-order-item-row',
  imports: [],
  templateUrl: './order-item-row.html',
})
export class OrderItemRow {
  item = input.required<OrderItem>();
}
