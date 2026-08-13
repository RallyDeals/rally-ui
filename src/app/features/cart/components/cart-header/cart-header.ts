import { Component, input } from '@angular/core';

@Component({
  selector: 'app-cart-header',
  imports: [],
  templateUrl: './cart-header.html',
})
export class CartHeader {
  itemsCount = input.required<number>();
  onClearCart = input.required<() => void>();
}
