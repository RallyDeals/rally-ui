import { Component, computed, inject } from '@angular/core';
import { CartHeader } from './cart-header/cart-header';
import { CartItem as CartItemComponent } from './cart-item/cart-item';
import { OrderSummary } from './order-summary/order-summary';
import { CartService } from '../../shared/services/cart.service';

const TAX_RATE = 0.07;

@Component({
  selector: 'app-cart',
  imports: [CartHeader, CartItemComponent, OrderSummary],
  templateUrl: './cart.html',
})
export class Cart {
  private readonly cartService = inject(CartService);

  readonly items = this.cartService.items;
  readonly totalUnits = this.cartService.totalUnits;
  readonly subtotal = this.cartService.subtotal;
  readonly estimatedTax = computed(() => this.subtotal() * TAX_RATE);
  readonly total = computed(() => this.subtotal() + this.estimatedTax());

  readonly incrementQuantity = this.cartService.increment;
  readonly decrementQuantity = this.cartService.decrement;
  readonly removeItem = this.cartService.remove;
  readonly clearCart = this.cartService.clear;
}
