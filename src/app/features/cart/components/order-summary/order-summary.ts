import { Component, input } from '@angular/core';

@Component({
  selector: 'app-order-summary',
  imports: [],
  templateUrl: './order-summary.html',
})
export class OrderSummary {
  itemsCount = input.required<number>();
  subtotal = input.required<number>();
  tax = input.required<number>();
  total = input.required<number>();
  checkoutDisabled = input(false);
}
