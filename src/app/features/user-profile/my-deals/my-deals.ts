import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { StatCard } from './stat-card/stat-card';
import { toMyDeal } from './my-deal.mapper';
import { DealStat } from '../interfaces/deal-stat';
import { UserService } from '../user.service';
import { DealOverview } from '../../deals/interfaces/DealOverview';
import { DealStatus } from '../../../shared/models/deal';
import { ParticipationStatus } from '../../deals/interfaces/Participation';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { SearchableSelect, SelectOption } from '../../../shared/components/searchable-select/searchable-select';
import { Router } from '@angular/router';

const MAX_DEALS = 3;

const PARTICIPATION_STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'left', label: 'Left' },
  { value: 'declined', label: 'Declined' },
];

const DEAL_STATUS_OPTIONS: { value: DealStatus; label: string }[] = [
  { value: DealStatus.PENDING, label: 'Gathering' },
  { value: DealStatus.ACTIVE, label: 'Active' },
  { value: DealStatus.SUCCEEDED, label: 'Succeeded' },
  { value: DealStatus.FAILED, label: 'Failed' }
];

@Component({
  selector: 'app-my-deals',
  imports: [StatCard, ErrorState, SearchableSelect, NgClass],
  templateUrl: './my-deals.html',
})
export class MyDeals {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  loading = signal(true);
  loadError = signal<ApiError | null>(null);
  private myDeals = signal<DealOverview[]>([]);
  private summary = signal({ activeDealsCount: 0, savedAmount: 0 });

  participationStatusOptions = PARTICIPATION_STATUS_OPTIONS;
  dealStatusOptions = DEAL_STATUS_OPTIONS;

  participationStatus = signal<ParticipationStatus | ''>('');
  dealStatusFilter = signal<ReadonlySet<DealStatus>>(new Set());

  deals = computed(() => this.myDeals().map(toMyDeal));

  stats = computed<DealStat[]>(() => {
    const { activeDealsCount, savedAmount } = this.summary();
    return [
      {
        label: 'Active Deals',
        value: String(activeDealsCount),
        icon: 'bolt',
        iconColorClass: 'text-primary',
        note: 'Ongoing right now',
      },
      {
        label: 'Total Saved',
        value: `$${savedAmount.toFixed(2)}`,
        icon: 'savings',
        iconColorClass: 'text-secondary',
        note: 'Across completed deals',
      },
    ];
  });

  constructor() {
    this.loadDeals();
    this.loadSummary();
  }

  onParticipationStatusChange(value: string) {
    this.participationStatus.set(value as ParticipationStatus | '');
    this.loadDeals();
  }

  isDealStatusSelected(status: DealStatus): boolean {
    return this.dealStatusFilter().has(status);
  }

  toggleDealStatus(status: DealStatus) {
    const next = new Set(this.dealStatusFilter());
    if (next.has(status)) {
      next.delete(status);
    } else {
      next.add(status);
    }
    this.dealStatusFilter.set(next);
    this.loadDeals();
  }

  loadDeals() {
    this.loading.set(true);
    this.loadError.set(null);
    this.userService
      .getMyDeals({
        size: MAX_DEALS,
        participationStatus: this.participationStatus() || undefined,
        dealStatus: [...this.dealStatusFilter()],
      })
      .subscribe({
        next: (response) => {
          this.myDeals.set(response.items);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.loadError.set(toApiError(err));
        },
      });
  }

  viewDealDetails(dealId: string){
    this.router.navigate(['/deals', dealId]);
  }

  private loadSummary() {
    this.userService.getMyDealsSummary().subscribe({
      next: (summary) => this.summary.set(summary),
    });
  }
}
