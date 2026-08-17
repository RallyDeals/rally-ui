import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { OrderPhaseBadge } from '../components/order-phase-badge/order-phase-badge';
import { OrderService } from '../../orders/order.service';
import { SellerOrderDetail as SellerOrderDetailModel } from '../../../shared/models/seller-order';
import { formatMoney } from '../../../shared/utils/money.util';
import { formatShortDate } from '../../../shared/utils/date-format.util';
import { orderCode } from '../../../shared/utils/order-code.util';

@Component({
  selector: 'app-seller-order-detail',
  imports: [Breadcrumbs, OrderPhaseBadge, RouterLink],
  templateUrl: './seller-order-detail.html',
  styleUrl: './seller-order-detail.css',
})
export class SellerOrderDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  private readonly orderId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly order = toSignal(this.orderService.getSellerOrderById(this.orderId), {
    initialValue: undefined as SellerOrderDetailModel | undefined,
  });

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Orders', link: '/seller/orders' },
    { label: orderCode(this.orderId) },
  ]);

  orderNumber = (id: string): string => orderCode(id);
  formatDate = (iso: string): string => formatShortDate(iso);
  price = (amount: number): string => formatMoney(amount);
  lineTotal = (unitPrice: number, quantity: number): string =>
    formatMoney(unitPrice * quantity);
}
