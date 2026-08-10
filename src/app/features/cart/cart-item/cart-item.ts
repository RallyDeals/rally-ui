import { Component, computed, input } from '@angular/core';
import { CartItem as CartItemModel } from '../interfaces/cart-item';

@Component({
  selector: 'app-cart-item',
  imports: [],
  templateUrl: './cart-item.html',
})
export class CartItem {
  item = input.required<CartItemModel>();
  onIncrement = input.required<(id: number) => void>();
  onDecrement = input.required<(id: number) => void>();
  onRemove = input.required<(id: number) => void>();

  subtotal = computed(() => this.item().price * this.item().quantity);
}
