import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { OrderSummary } from '../../interfaces/order-summary';

@Component({
  selector: 'app-order-summary',
  imports: [CurrencyPipe],
  templateUrl: './order-summary.html',
})
export class OrderSummaryComponent {
  summary = input.required<OrderSummary>();
}
