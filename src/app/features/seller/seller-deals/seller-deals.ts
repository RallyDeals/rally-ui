import { Component, DestroyRef, NgZone, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, interval, switchMap, startWith } from 'rxjs';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { FilterPills } from '../../../shared/components/filter-pills/filter-pills';
import { SearchInput } from '../../../shared/components/search-input/search-input';
import { DealStatusBadge } from '../components/deal-status-badge/deal-status-badge';
import { DealProgress, ProgressTone } from '../components/deal-progress/deal-progress';
import { MetricCard } from '../components/metric-card/metric-card';
import {
  ConfirmDialog,
  ConfirmDialogRequest,
} from '../../../shared/components/confirm-dialog/confirm-dialog';
import { DealStatus } from '../../../shared/models/deal';
import { resolveImageUrl } from '../../../shared/utils/image-url';
import { PageResponse } from '../../products/page-response';
import { DealOverview } from '../../deals/interfaces/deal-overview';
import { DealRowActions } from './deal-row-actions/deal-row-actions';
import { DEAL_STATUS_OPTIONS, DealRow, PROGRESS_TONES, StatusFilter, formatCountdown, toDealRow } from './seller-deals.model';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { DealsService } from '../../deals/deals.service';

const COUNTDOWN_TICK_MS = 1_000;

const DEALS_POLL_INTERVAL_MS = 30_000;
const PAGE_SIZE = 5;

@Component({
  selector: 'app-seller-deals',
  imports: [
    DatePipe,
    RouterLink,
    Pagination,
    FilterPills,
    SearchInput,
    DealStatusBadge,
    DealProgress,
    MetricCard,
    ConfirmDialog,
    DealRowActions,
  ],
  templateUrl: './seller-deals.html',
  styleUrl: './seller-deals.css',
})
export class SellerDeals implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly dealsService = inject(DealsService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  private dealsPollSub: Subscription | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  private readonly now = signal(Date.now());

  readonly statusOptions = DEAL_STATUS_OPTIONS;
  readonly progressToneFor = (status: DealStatus): ProgressTone => PROGRESS_TONES[status];
  readonly DealStatus = DealStatus;
  readonly resolveImageUrl = resolveImageUrl;

  statusFilter = signal<StatusFilter>('ALL');
  searchQuery = signal('');
  page = signal(1);
  limit = PAGE_SIZE;
  total = signal(0);
  allDealsTotal = signal(0);
  deals = signal<DealRow[]>([]);
  loading = signal(true);
  loadingError = signal<ApiError|null>(null);
  deleteTarget = signal<DealRow | null>(null);

  readonly hasActiveFilters = computed(
    () => this.statusFilter() !== null || this.searchQuery().trim().length > 0,
  );

  readonly emptyState = computed(() => {
    if (this.hasActiveFilters() && this.allDealsTotal() > 0) {
      return {
        title: 'No deals found',
        message: 'Try adjusting your filters to see matching deals.',
        icon: 'search_off',
        actionLabel: null,
      };
    }
    return {
      title: 'No deals yet',
      message: 'When you create a deal, it will show up here.',
      icon: 'group_off',
      actionLabel: 'New Deal',
    };
  });

  readonly deleteRequest = computed<ConfirmDialogRequest | null>(() => {
    const deal = this.deleteTarget();
    if (!deal) {
      return null;
    }
    return {
      title: `Delete "${deal.name}"?`,
      message: "This deal hasn't started yet and has no participants — it will be permanently cancelled.",
      icon: 'delete',
      confirmLabel: 'Delete',
    };
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));

  readonly pageRange = computed(() => {
    const total = this.total();
    if (total === 0) {
      return { from: 0, to: 0 };
    }
    return { from: (this.page() - 1) * this.limit + 1, to: Math.min(this.page() * this.limit, total) };
  });

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const status = params['status'] as string | undefined;
      if (status && this.isValidStatus(status)) {
        this.statusFilter.set(status);
        this.page.set(1);
      }
    });
    this.loadDeals();
    this.countdownTimer = setInterval(() => this.now.set(Date.now()), COUNTDOWN_TICK_MS);
    this.destroyRef.onDestroy(() => this.stopDealsPoll());
  }

  ngOnDestroy() {
    this.stopDealsPoll();
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }

  countdownLabel(endTime: string | null): string {
    if (!endTime) {
      return '';
    }
    const secondsLeft = Math.max(0, Math.round((new Date(endTime).getTime() - this.now()) / 1000));
    return formatCountdown(secondsLeft);
  }

  private isValidStatus(value: string): value is StatusFilter {
    return value === 'ALL' || Object.values(DealStatus).includes(value as DealStatus);
  }

  loadDeals() {
    this.loading.set(true);
    const sellerId = this.authService.currentUser()?.id;
    if (!sellerId) {
      this.loading.set(false);
      this.loadingError.set(toApiError(new Error('Unauthorized: no seller ID found for current user')));
      return;
    }

    this.dealsService.getSellerDeals(sellerId, this.currentParams()).subscribe({
      next: (response) => {
        this.applyResponse(response);
        this.loading.set(false);
        this.startDealsPoll(sellerId);
      },
      error: () => {
        this.deals.set([]);
        this.total.set(0);
        this.loading.set(false);
      },
    });
  }

  private applyResponse(response: PageResponse<DealOverview>) {
    this.deals.set(response.items.map(toDealRow));
    this.total.set(response.total);
    if (!this.hasActiveFilters()) {
      this.allDealsTotal.set(response.total);
    }
  }

  private currentParams() {
    const status = this.statusFilter();
    const search = this.searchQuery().trim();
    return {
      status: status === 'ALL' ? undefined : status,
      search: search || undefined,
      page: this.page(),
      limit: this.limit,
    };
  }

  private startDealsPoll(sellerId: string) {
    this.stopDealsPoll();
    this.ngZone.runOutsideAngular(() => {
      this.dealsPollSub = interval(DEALS_POLL_INTERVAL_MS)
        .pipe(
          startWith(0),
          switchMap(() => this.dealsService.getSellerDeals(sellerId, this.currentParams())),
        )
        .subscribe({
          next: (response) => {
            this.ngZone.run(() => this.applyResponse(response));
          },
        });
    });
  }

  private stopDealsPoll() {
    this.dealsPollSub?.unsubscribe();
    this.dealsPollSub = null;
  }

  onStatusChange = (status: string) => {
    this.statusFilter.set(this.isValidStatus(status) ? status : 'ALL');
    this.page.set(1);
    this.loadDeals();
  };

  onSearchInput = (value: string) => {
    this.searchQuery.set(value);
    this.page.set(1);
    this.loadDeals();
  };

  clearSearch = () => {
    this.searchQuery.set('');
    this.page.set(1);
    this.loadDeals();
  };

  goToPage = (page: number) => {
    this.page.set(page);
    this.loadDeals();
  };

  deleteDeal = (id: string) => {
    this.deleteTarget.set(this.deals().find((deal) => deal.id === id) ?? null);
  };

  closeDeleteDialog = () => {
    this.deleteTarget.set(null);
  };

  onDeleteConfirmed = () => {
    const deal = this.deleteTarget();
    this.deleteTarget.set(null);
    if (!deal) {
      return;
    }
    this.dealsService.cancelDeal(deal.id).subscribe({
      next: () => this.loadDeals(),
    });
  };
}
