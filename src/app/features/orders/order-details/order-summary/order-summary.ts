import { Component, input } from '@angular/core';
import { OrderSummary } from '../../interfaces/order-summary';

@Component({
  selector: 'app-order-summary',
  imports: [],
  templateUrl: './order-summary.html',
})
export class OrderSummaryComponent {
  summary = input.required<OrderSummary>();
}
