import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FilterPills, FilterPillOption } from '../../../shared/components/filter-pills/filter-pills';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { SearchInput } from '../../../shared/components/search-input/search-input';
import { IconButton } from '../../../shared/components/icon-button/icon-button';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { MetricCard } from '../components/metric-card/metric-card';
import { OrderPhaseBadge } from '../components/order-phase-badge/order-phase-badge';
import {
  SellerOrder,
  SellerOrderPhase,
} from '../../../shared/models/seller-order';
import { SellerOrderService } from './seller-order.service';
import { formatMoney } from '../../../shared/utils/money.util';
import { formatShortDate } from '../../../shared/utils/date-format.util';
import { orderCode, productCode } from '../../../shared/utils/order-code.util';
import { dateInRange, todayISO, daysAgoISO } from '../../../shared/utils/date-range.util';

export const ORDER_PHASE_OPTIONS: FilterPillOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPING', label: 'Shipping' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const RANGE_START = daysAgoISO(30);
const RANGE_END = todayISO();
const RANGE_LABEL = 'Last 30 Days';

@Component({
  selector: 'app-seller-orders',
  imports: [
    FilterPills,
    Pagination,
    SearchInput,
    IconButton,
    PageHeader,
    MetricCard,
    OrderPhaseBadge,
  ],
  templateUrl: './seller-orders.html',
  styleUrl: './seller-orders.css',
})
export class SellerOrders {
  private readonly router = inject(Router);
  private readonly orderService = inject(SellerOrderService);

  readonly phaseOptions = ORDER_PHASE_OPTIONS;

  phaseFilter = signal<'ALL' | SellerOrderPhase>('ALL');
  searchQuery = signal('');
  page = signal(1);
  limit = 5;
  orders = toSignal(this.orderService.listOrders(), { initialValue: [] });

  readonly rangeOrders = computed(() =>
    this.orders().filter((order) => dateInRange(order.createdAt, RANGE_START, RANGE_END)),
  );

  readonly rangeLabel = computed(() => RANGE_LABEL);

  readonly visibleOrders = computed(() => {
    const phase = this.phaseFilter();
    const query = this.searchQuery().trim().toLowerCase();
    return this.rangeOrders().filter((order) => {
      const matchesPhase = phase === 'ALL' || order.phase === phase;
      const matchesQuery =
        query === '' ||
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.items.some((entry) => entry.productName.toLowerCase().includes(query));
      return matchesPhase && matchesQuery;
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.visibleOrders().length / this.limit)),
  );

  readonly pagedOrders = computed(() => {
    const start = (this.page() - 1) * this.limit;
    return this.visibleOrders().slice(start, start + this.limit);
  });

  get fromIndex(): number {
    return this.visibleOrders().length === 0 ? 0 : (this.page() - 1) * this.limit + 1;
  }

  get toIndex(): number {
    return Math.min(this.page() * this.limit, this.visibleOrders().length);
  }

  readonly totalOrdersValue = computed(() => String(this.rangeOrders().length));

  readonly revenueValue = computed(() => {
    const total = this.rangeOrders().reduce((sum, order) => sum + order.totalPrice, 0);
    return `$${formatMoney(total)}`;
  });

  readonly pendingValue = computed(
    () => String(this.rangeOrders().filter((order) => order.phase === 'PENDING').length),
  );

  readonly deliveredValue = computed(
    () => String(this.rangeOrders().filter((order) => order.phase === 'DELIVERED').length),
  );

  orderNumber = (id: string): string => orderCode(id);
  productNumber = (productId: string): string => productCode(productId);
  price = (amount: number): string => formatMoney(amount);
  formatDate = (iso: string): string => formatShortDate(iso);

  totalQuantity(order: SellerOrder): number {
    return order.items.reduce((sum, entry) => sum + entry.quantity, 0);
  }

  extraItemsLabel(order: SellerOrder): string {
    const extras = order.items.length - 1;
    return extras > 0 ? ` · +${extras} more item${extras > 1 ? 's' : ''}` : '';
  }

  onPhaseChange = (phase: string) => {
    this.phaseFilter.set(phase as 'ALL' | SellerOrderPhase);
    this.page.set(1);
  };

  onSearchInput = (value: string) => {
    this.searchQuery.set(value);
    this.page.set(1);
  };

  clearSearch = () => {
    this.searchQuery.set('');
    this.page.set(1);
  };

  goToPage = (page: number) => {
    this.page.set(page);
  };

  viewOrder = (id: string) => {
    this.router.navigate(['/seller/orders', id]);
  };
}
