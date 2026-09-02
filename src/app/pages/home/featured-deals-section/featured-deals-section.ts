import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import { DealCard } from './deal-card/deal-card';
import { DealOverview } from '../../../features/deals/interfaces/deal-overview';
import { DealsService } from '../../../features/deals/deals.service';
import { DealStatus } from '../../../shared/models/deal';

const FEATURED_DEALS_LIMIT = 3;

@Component({
  selector: 'app-featured-deals-section',
  imports: [DealCard, RouterLink],
  templateUrl: './featured-deals-section.html',
})
export class FeaturedDealsSection implements OnInit {
  private readonly dealsService = inject(DealsService);

  deals = signal<DealOverview[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.dealsService
      .getDealsOverview({ status: DealStatus.ACTIVE, sort: 'most-joined', limit: FEATURED_DEALS_LIMIT })
      .pipe(
        switchMap((active) => {
          const remaining = FEATURED_DEALS_LIMIT - active.items.length;
          if (remaining <= 0) {
            return of(active.items);
          }
          // Not enough active deals to fill the section — pad with pending deals globally.
          return this.dealsService
            .getDealsOverview({ status: DealStatus.PENDING, sort: 'most-joined', limit: remaining })
            .pipe(map((pending) => [...active.items, ...pending.items]));
        }),
      )
      .subscribe({
        next: (deals) => {
          this.deals.set(deals);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
