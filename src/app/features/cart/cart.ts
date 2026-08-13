import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartHeader } from './components/cart-header/cart-header';
import { CartItem as CartItemComponent } from './components/cart-item/cart-item';
import { OrderSummary } from './components/order-summary/order-summary';
import { CheckoutAddress } from './components/checkout-address/checkout-address';
import { PaymentMethodPicker } from './components/payment-method-picker/payment-method-picker';
import { CartService } from './cart.service';
import { OrderService } from '../orders/order.service';
import { ApiError } from '../../shared/models/api-error';
import { toApiError } from '../../shared/utils/api-error.util';
import { ErrorModal } from '../../shared/components/error-modal/error-modal';

const TAX_RATE = 0.08;

@Component({
  selector: 'app-cart',
  imports: [
    CartHeader,
    CartItemComponent,
    OrderSummary,
    CheckoutAddress,
    PaymentMethodPicker,
    ErrorModal,
    RouterLink,
  ],
  templateUrl: './cart.html',
})
export class Cart {
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

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

  readonly isCheckingOut = signal(false);
  readonly checkoutError = signal<ApiError | null>(null);

  readonly setAddress = (value: string) => this.address.set(value);
  readonly selectPaymentMethod = (id: string) => this.selectedPaymentMethodId.set(id);

  checkout(): void {
    const paymentMethodId = this.selectedPaymentMethodId();
    if (this.checkoutDisabled() || !paymentMethodId) {
      return;
    }
    this.isCheckingOut.set(true);
    this.orderService
      .checkout({
        orderItems: this.items().map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        paymentMethodId,
        address: this.address(),
      })
      .subscribe({
        next: (response) => {
          this.isCheckingOut.set(false);
          this.cartService.clear();
          this.router.navigate(['/orders', response.id]);
        },
        error: (err) => {
          this.isCheckingOut.set(false);
          this.checkoutError.set(toApiError(err));
        },
      });
  }
}
