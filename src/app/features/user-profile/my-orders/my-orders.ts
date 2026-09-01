import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BriefOrderResponse } from '../../orders/interfaces/brief-order-response';
import { MyOrdersStatistics, OrderService } from '../../orders/order.service';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { ErrorModal } from '../../../shared/components/error-modal/error-modal';
import { ShippingStatusBadge } from '../../../shared/components/shipping-status-badge/shipping-status-badge';
import { OrderStatusBadge } from '../../../shared/components/order-status-badge/order-status-badge';
import { OrderType } from '../../../shared/models/order-type';
import { OrderStatusFiltration } from '../../../shared/models/order-status-filtration';
import { StatCard } from '../my-deals/stat-card/stat-card';
import { SearchableSelect } from '../../../shared/components/searchable-select/searchable-select';
import { StatCardInfo } from '../interfaces/stat-card-info';

const PAGE_SIZE = 2;
const ORDER_STATUS_OPTIONS: { value: OrderStatusFiltration; label: string }[] = [
  { value: OrderStatusFiltration.PENDING_PAYMENT, label: 'Pending Payment' },
  { value: OrderStatusFiltration.DELIVERED, label: 'Delivered' },
  { value: OrderStatusFiltration.CANCELLED, label: 'Cancelled' },
  { value: OrderStatusFiltration.PENDING_DELIVERY, label: 'Pending Delivery' },
];
const ORDER_TYPE_OPTIONS: { value: OrderType; label: string }[] = [
  { value: OrderType.NORMAL, label: 'Regular Orders' },
  { value: OrderType.DEAL, label: 'Deal Orders' },
];

@Component({
  selector: 'app-my-orders',
  imports: [
    ErrorState,
    ErrorModal,
    RouterLink,
    DatePipe,
    CurrencyPipe,
    ShippingStatusBadge,
    OrderStatusBadge,
    StatCard,
    SearchableSelect,
  ],
  templateUrl: './my-orders.html',
})
export class MyOrders {
  private orderService = inject(OrderService);

  orderStatusOptions = ORDER_STATUS_OPTIONS;
  orderTypeOptions = ORDER_TYPE_OPTIONS;

  orders = signal<BriefOrderResponse[]>([]);
  ordersStatistics = signal<MyOrdersStatistics | null>(null);
  isLoading = signal(false);
  loadError = signal<ApiError | null>(null);
  loadMoreError = signal<ApiError | null>(null);
  private total = signal(0);
  private allOrdersTotal = signal(0);
  private page = signal(1);
  orderStatusFilter = signal<ReadonlySet<OrderStatusFiltration>>(new Set());
  orderType = signal<OrderType | ''>('');

  hasMore = computed(() => this.page() * PAGE_SIZE < this.total());
  hasActiveFilters = computed(() => this.orderStatusFilter().size > 0 || this.orderType() !== '');
  emptyState = computed(() => {
    if (this.hasActiveFilters() && this.allOrdersTotal() > 0) {
      return {
        title: 'No orders found',
        message: 'Try adjusting your filters to see matching orders.',
        icon: 'search_off',
        actionLabel: null,
      };
    }

    return {
      title: 'No orders yet',
      message: 'When you place an order, it will show up here.',
      icon: 'shopping_bag',
      actionLabel: 'Browse Products',
    };
  });

  stats = computed<StatCardInfo[]>(() => {
    const stat = this.ordersStatistics();
    if(stat === null)
      return [];
    return [
      {
        label: 'Delivered Orders',
        value: String(stat.deliveredOrders),
        icon: 'check_circle',
        iconColorClass: 'text-success',
        note: 'Completed orders',
      },
      {
        label: 'Cancelled Orders',
        value: String(stat.cancelledOrders),
        icon: 'cancel',
        iconColorClass: 'text-danger',
        note: 'Orders that were cancelled',
      },
      {
        label: 'Pending Delivery',
        value: String(stat.pendingDelivery),
        icon: 'local_shipping',
        iconColorClass: 'text-warning',
        note: 'Orders awaiting delivery',
      },
      {
        label: 'Pending Payment',
        value: String(stat.pendingPayment),
        icon: 'payment',
        iconColorClass: 'text-info',
        note: 'Orders awaiting payment',
      },
    ];
  });

  constructor() {
    this.loadPage();
    this.loadStatistics();
  }

  loadMore(): void {
    this.page.update((page) => page + 1);
    this.loadPage();
  }

  isOrderStatusSelected(status: OrderStatusFiltration): boolean {
    return this.orderStatusFilter().has(status);
  }

  toggleOrderStatus(status: OrderStatusFiltration) {
    const next = new Set(this.orderStatusFilter());
    if (next.has(status)) {
      next.delete(status);
    } else {
      next.add(status);
    }
    this.orderStatusFilter.set(next);
    this.page.set(1);
    this.loadPage();
  }

  onOrderTypeChange(value: string) {
    this.orderType.set(value as OrderType | '');
    this.page.set(1);
    this.loadPage();
  }

  private loadStatistics() {
    this.orderService.getMyOrdersStatistics().subscribe({
      next: (response) => {
        this.ordersStatistics.set(response);
      },
      error: (err) => {
        const apiError = toApiError(err);
        console.error('Failed to load order statistics:', apiError);
      },
    });
  }

  private loadPage(): void {
    const isFirstPage = this.page() === 1;
    const hasActiveFiltersAtRequestTime = this.hasActiveFilters();
    this.isLoading.set(true);
    this.orderService
      .getMyOrders({
        page: this.page(),
        limit: PAGE_SIZE,
        status: [...this.orderStatusFilter()],
        type: this.orderType() || null,
      })
      .subscribe({
        error: (err) => {
          this.isLoading.set(false);
          const apiError = toApiError(err);
          if (isFirstPage) {
            this.loadError.set(apiError);
          } else {
            this.page.update((page) => page - 1);
            this.loadMoreError.set(apiError);
          }
        },
        next: (response) => {
          this.orders.set(response.orders);
          this.total.set(response.total);
          if (!hasActiveFiltersAtRequestTime) {
            this.allOrdersTotal.set(response.total);
          }
          this.isLoading.set(false);
        },
      });
  }
}
