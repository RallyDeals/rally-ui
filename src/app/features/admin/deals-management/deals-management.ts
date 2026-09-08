import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { DealsStats } from './deals-stats/deals-stats';
import { DealsToolbar } from './deals-toolbar/deals-toolbar';
import { DealRow } from './deal-row/deal-row';
import { DealsService } from '../../deals/deals.service';
import { DealOverview } from '../../deals/interfaces/deal-overview';

const PAGE_SIZE = 5;

@Component({
  selector: 'app-deals-management',
  imports: [PageHeader, DealsStats, DealsToolbar, DealRow, Pagination, ErrorState],
  templateUrl: './deals-management.html',
})
export class DealsManagement implements OnInit {
  private readonly dealsService = inject(DealsService);

  deals = signal<DealOverview[]>([]);
  total = signal(0);
  loading = signal(true);
  loadError = signal<ApiError | null>(null);
  search = signal('');
  status = signal<string>('ALL');
  page = signal(1);

  totalDeals = signal(0);
  dealsCreatedThisMonth = signal(0);
  activeDeals = signal(0);
  dealsCreatedToday = signal(0);
  completedDeals = signal(0);
  successRate = signal(0);

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));
  rangeStart = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * PAGE_SIZE + 1));
  rangeEnd = computed(() => Math.min(this.page() * PAGE_SIZE, this.total()));

  ngOnInit() {
    this.loadDeals();
    this.loadAnalytics();
  }

  loadDeals() {
    this.loading.set(true);
    this.loadError.set(null);
    this.dealsService
      .getDealsOverview({
        search: this.search(),
        status: this.status() || 'ALL',
        page: this.page(),
        limit: PAGE_SIZE,
      })
      .subscribe({
        next: (response) => {
          this.deals.set(response.items);
          this.total.set(response.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.loadError.set(toApiError(err));
          this.loading.set(false);
        },
      });
  }

  loadAnalytics() {
    this.dealsService.getAdminDealsAnalytics().subscribe({
      next: (response) => {
        this.totalDeals.set(response.totalDeals);
        this.dealsCreatedThisMonth.set(response.dealsCreatedThisMonth);
        this.activeDeals.set(response.activeDeals);
        this.dealsCreatedToday.set(response.dealsCreatedToday);
        this.completedDeals.set(response.completedDeals);
        this.successRate.set(response.successRate);
      },
      error: (err) => {
        console.error('Error loading deals analytics:', err);
      },
    });
  }

  onSearchChange = (value: string) => {
    this.search.set(value);
    this.page.set(1);
    this.loadDeals();
  };

  onStatusChange = (status: string) => {
    this.status.set(status);
    this.page.set(1);
    this.loadDeals();
  };

  onPageChange = (page: number) => {
    this.page.set(page);
    this.loadDeals();
  };
}
