import { Component, effect, inject, input, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { OrderHeader } from './order-header/order-header';
import { ShippingAddressCard } from './shipping-address-card/shipping-address-card';
import { PaymentMethodCard } from './payment-method-card/payment-method-card';
import { OrderItemsList } from './order-items-list/order-items-list';
import { OrderSummaryComponent } from './order-summary/order-summary';
import { OrderHeaderInfo } from '../interfaces/order-header-info';
import { PaymentMethod } from '../interfaces/payment-method';
import { OrderItem } from '../interfaces/order-item';
import { OrderSummary } from '../interfaces/order-summary';
import { OrderService } from '../order.service';
import { DetailedOrderResponse } from '../interfaces/detailed-order-response';
import { ActivatedRoute } from '@angular/router';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { resolveImageUrl } from '../../../shared/utils/image-url';
import { ErrorState } from '../../../shared/components/error-state/error-state';

const SHIPPING_COST = 20;
const TAX_RATE = 0.08;

@Component({
  selector: 'app-order-details',
  imports: [
    OrderHeader,
    ShippingAddressCard,
    PaymentMethodCard,
    OrderItemsList,
    OrderSummaryComponent,
    ErrorState,
  ],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails {
  private orderService = inject(OrderService);
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);
  orderId = this.activatedRoute.snapshot.paramMap.get('orderId');
  order = signal<DetailedOrderResponse | null>(null);
  header = signal<OrderHeaderInfo | null>(null);
  shippingAddress = signal<string | null>(null);
  paymentMethod = signal<PaymentMethod | null>(null);
  orderItems = signal<OrderItem[]>([]);
  orderSummary = signal<OrderSummary | null>(null);
  error = signal<ApiError | null>(null);

  constructor() {
    effect(() => {
      const orderId = this.orderId;
      if (!orderId) {
        return;
      }
      this.error.set(null);
      this.orderService.getOrderById(orderId).subscribe({
        error: (err) => {
          console.error('Failed to load order', orderId, err);
          this.error.set(toApiError(err));
        },
        next: (response) => {
          this.order.set(response);
          this.titleService.setTitle(`Order #${response.orderId.slice(0, 8).toUpperCase()}`);
          this.header.set({
            deliveryType: 'STANDARD DELIVERY',
            placedDate: response.createdAt,
            orderNumber: response.orderId.slice(0, 8).toUpperCase(),
            dealNumber: response.dealId?.slice(0, 8).toUpperCase(),
            orderStatus: response.status,
            shippingStatus: response.shippingStatus,
            cancelReason: response.cancelReason,
            paymentErrorMessage: response.paymentErrorMessage,
          });
          this.shippingAddress.set(response.address);
          this.paymentMethod.set({
            brand: response.cardBrand,
            lastFourDigits: response.cardLast4,
            expiry: response.cardExpMonth + '/' + response.cardExpYear,
          });
          this.orderItems.set(
            response.orderProducts.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              productImageUrl: resolveImageUrl(item.productImageUrl),
            })),
          );
          const subtotal =
            Math.round(((response.totalPrice - SHIPPING_COST) / (1 + TAX_RATE)) * 100) / 100;
          const estimatedTaxes =
            Math.round((response.totalPrice - SHIPPING_COST - subtotal) * 100) / 100;
          this.orderSummary.set({
            subtotal,
            shippingLabel: 'Shipping (Standard)',
            shippingCost: SHIPPING_COST,
            estimatedTaxes,
            total: response.totalPrice,
            totalNote: 'Including VAT',
          });
        },
      });
    });
  }
}
