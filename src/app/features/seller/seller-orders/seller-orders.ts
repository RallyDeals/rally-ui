import { Component, computed, inject, signal } from '@angular/core';
import {
  FilterPills,
  FilterPillOption,
} from '../../../shared/components/filter-pills/filter-pills';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { SearchInput } from '../../../shared/components/search-input/search-input';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { MetricCard } from '../components/metric-card/metric-card';
import { OrderService } from '../../orders/order.service';
import { formatShortDate } from '../../../shared/utils/date-format.util';
import { daysAgoISO } from '../../../shared/utils/date-range.util';
import { CompactedOrderStatus } from '../../../shared/models/compacted-order-status';
import { toApiError } from '../../../shared/utils/api-error.util';
import { ApiError } from '../../../shared/models/api-error';
import { BriefSellerOrdersResponse } from '../../orders/interfaces/brief-seller-orders-response';
import { SellerOrdersParams } from '../../orders/interfaces/seller-orders-params';
import { SellerOrdersStatistics } from '../../orders/interfaces/seller-orders-statistics';
import { SellerOrderRow } from './seller-order-row/seller-order-row';


const PAGE_SIZE = 5;

@Component({
  selector: 'app-seller-orders',
  imports: [
    FilterPills,
    Pagination,
    SearchInput,
    PageHeader,
    MetricCard,
    SellerOrderRow,
  ],
  templateUrl: './seller-orders.html',
  styleUrl: './seller-orders.css',
})
export class SellerOrders {
  private readonly orderService = inject(OrderService);

  orders = signal<BriefSellerOrdersResponse[]>([]);
  analytics = signal<SellerOrdersStatistics>({
    pendingOrders: 0,
    deliveredOrders: 0,
    totalOrders: 0,
    revenue: 0,
  });
  startDate = signal<string>(daysAgoISO(7));
  dateLabel = signal<string>('Last 7 Days');
  isLoading = signal(false);
  loadError = signal<ApiError | null>(null);
  analyticsError = signal<ApiError | null>(null);
  loadMoreError = signal<ApiError | null>(null);
  phaseFilter = signal<'ALL' | CompactedOrderStatus>('ALL');
  searchQuery = signal('');
  page = signal(1);
  total = signal(0);
  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));
  rangeStart = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * PAGE_SIZE + 1));
  rangeEnd = computed(() => Math.min(this.page() * PAGE_SIZE, this.total()));

  phaseOptions: FilterPillOption[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PROCESSING' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  dateRangeOptions: FilterPillOption[] = [
    { label: 'Last 7 Days', value: '7' },
    { label: 'Last 30 Days', value: '30' },
    { label: 'Last 90 Days', value: '90' },
  ];

  formatDate = (iso: string): string => formatShortDate(iso);

  constructor() {
    this.loadPage();
    this.loadAnalytics();
  }

  onPhaseChange = (phase: string) => {
    this.phaseFilter.set(phase as 'ALL' | CompactedOrderStatus);
    this.page.set(1);
    this.loadPage();
  };

  onDateRangeChange = (days: string) => {
    const daysNum = parseInt(days, 10);
    this.startDate.set(daysAgoISO(daysNum));
    this.dateLabel.set(this.dateRangeOptions.find(opt => opt.value === days)?.label || 'Last 30 Days');
    this.page.set(1);
    this.loadPage();
  };

  onSearchInput = (value: string) => {
    this.searchQuery.set(value);
    this.page.set(1);
    this.loadPage();
  };

  onPageChange = (page: number) => {
    this.page.set(page);
    this.loadPage();
  };

  clearSearch = () => {
    this.searchQuery.set('');
    this.page.set(1);
    this.loadPage();
  };

  loadPage() {
    const isFirstPage = this.page() === 1;
    this.isLoading.set(true);
    const queryParams: SellerOrdersParams = {
      page: this.page(),
      limit: PAGE_SIZE,
      status: this.phaseFilter(),
      search: this.searchQuery(),
      startDate: this.startDate(),
    };
    this.orderService.listSellerOrders(queryParams).subscribe({
      next: (response) => {
        this.orders.set(response.orders);
        this.total.set(response.total);
        this.isLoading.set(false);
      },
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
    });
  }

  loadAnalytics() {
    this.orderService.getSellerOrdersAnalytics(this.startDate()).subscribe({
      next: (response) => {
        this.analytics.set(response);
      },
      error: (err) => {
        const apiError = toApiError(err);
        this.analyticsError.set(apiError);
      },
    });
  }
}
