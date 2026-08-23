import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DealCard } from './deal-card/deal-card';
import { DealOverview } from '../../../features/deals/interfaces/DealOverview';
import { DealsService } from '../../../features/deals/deals.service';
import { DealStatus } from '../../../shared/models/deal';

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
    this.dealsService.getDealsOverview({ status: DealStatus.ACTIVE, sort: 'most-joined', limit: 3 }).subscribe({
      next: (res) => {
        this.deals.set(res.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
