import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { OrderPhaseBadge } from '../components/order-phase-badge/order-phase-badge';
import { OrderService } from '../../orders/order.service';
import { formatMoney } from '../../../shared/utils/money.util';
import { formatShortDate } from '../../../shared/utils/date-format.util';
import { orderCode } from '../../../shared/utils/order-code.util';
import { DetailedSellerOrderResponse } from '../../orders/interfaces/detailed-seller-order-response';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { PLACEHOLDER_IMAGE } from '../../../shared/constants/placeholder';
import { resolveImageUrl } from '../../../shared/utils/image-url';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';

@Component({
  selector: 'app-seller-order-detail',
  imports: [
    Breadcrumbs,
    OrderPhaseBadge,
    RouterLink,
    DatePipe,
    CurrencyPipe,
    ImageFallbackDirective,
  ],
  templateUrl: './seller-order-detail.html',
  styleUrl: './seller-order-detail.css',
})
export class SellerOrderDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  private readonly orderId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly order = signal<DetailedSellerOrderResponse | undefined>(undefined);

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Orders', link: '/seller/orders' },
    { label: orderCode(this.orderId) },
  ]);

  orderNumber = (id: string): string => orderCode(id);
  error = signal<ApiError | null>(null);

  constructor() {
    this.loadOrder();
  }

  loadOrder() {
    this.orderService.getSellerOrderById(this.orderId).subscribe({
      next: (order) => {
        this.order.set(order);
      },
      error: (err) => {
        this.error.set(toApiError(err));
      },
    });
  }

  protected readonly placeholderImage = PLACEHOLDER_IMAGE;
  protected readonly resolveImageUrl = resolveImageUrl;
}
