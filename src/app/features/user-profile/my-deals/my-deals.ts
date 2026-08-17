import { Component, computed, inject, signal } from '@angular/core';
import { StatCard } from './stat-card/stat-card';
import { MyDealCard } from './my-deal-card/my-deal-card';
import { toMyDeal } from './my-deal.mapper';
import { DealStat } from '../interfaces/deal-stat';
import { DealsService } from '../../deals/deals.service';
import { TokenService } from '../../../shared/services/token.service';
import { DealStatus } from '../../../shared/models/deal';
import { DealOverview } from '../../deals/interfaces/DealOverview';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { ErrorState } from '../../../shared/components/error-state/error-state';

const MAX_DEALS = 50;

@Component({
  selector: 'app-my-deals',
  imports: [StatCard, MyDealCard, ErrorState],
  templateUrl: './my-deals.html',
})
export class MyDeals {
  private readonly dealsService = inject(DealsService);
  private readonly tokenService = inject(TokenService);

  loading = signal(true);
  loadError = signal<ApiError | null>(null);
  private myDeals = signal<DealOverview[]>([]);

  deals = computed(() => this.myDeals().map(toMyDeal));

  stats = computed<DealStat[]>(() => {
    const deals = this.myDeals();
    const activeCount = deals.filter((deal) => deal.status === DealStatus.ACTIVE).length;
    const totalSaved = deals
      .filter((deal) => deal.status === DealStatus.SUCCEEDED)
      .reduce((sum, deal) => sum + Math.max(0, deal.originalPrice - deal.dealPrice), 0);
    return [
      {
        label: 'Active Deals',
        value: String(activeCount),
        icon: 'bolt',
        iconColorClass: 'text-primary',
        note: 'Ongoing right now',
      },
      {
        label: 'Total Saved',
        value: `$${totalSaved.toFixed(2)}`,
        icon: 'savings',
        iconColorClass: 'text-secondary',
        note: 'Across completed deals',
      },
    ];
  });

  constructor() {
    this.loadDeals();
  }

  loadDeals() {
    const buyerId = this.tokenService.getUserId();
    if (!buyerId) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.loadError.set(null);
    this.dealsService.getMyDeals(buyerId, { limit: MAX_DEALS }).subscribe({
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
}
