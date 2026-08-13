import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartHeader } from './components/cart-header/cart-header';
import { CartItem as CartItemComponent } from './components/cart-item/cart-item';
import { OrderSummary } from './components/order-summary/order-summary';
import { CheckoutAddress } from './components/checkout-address/checkout-address';
import { PaymentMethodPicker } from './components/payment-method-picker/payment-method-picker';
import { CartService } from './cart.service';

const TAX_RATE = 0.08;

@Component({
  selector: 'app-cart',
  imports: [
    CartHeader,
    CartItemComponent,
    OrderSummary,
    CheckoutAddress,
    PaymentMethodPicker,
    RouterLink,
  ],
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

  readonly address = signal('');
  readonly selectedPaymentMethodId = signal<string | null>(null);
  readonly checkoutDisabled = computed(
    () => !this.address().trim() || !this.selectedPaymentMethodId(),
  );

  readonly setAddress = (value: string) => this.address.set(value);
  readonly selectPaymentMethod = (id: string) => this.selectedPaymentMethodId.set(id);
}
