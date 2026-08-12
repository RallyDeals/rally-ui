import { Component, computed, input } from '@angular/core';
import { CartItem as CartItemModel } from '../../../shared/models/cart-item';

@Component({
  selector: 'app-cart-item',
  imports: [],
  templateUrl: './cart-item.html',
})
export class CartItem {
  item = input.required<CartItemModel>();
  onIncrement = input.required<(id: string) => void>();
  onDecrement = input.required<(id: string) => void>();
  onRemove = input.required<(id: string) => void>();

  subtotal = computed(() => this.item().price * this.item().quantity);
}
