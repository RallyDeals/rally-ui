import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DealCard } from './deal-card/deal-card';
import { DealsService, DealView } from '../../../features/deals/deals.service';

@Component({
  selector: 'app-featured-deals-section',
  imports: [DealCard, RouterLink],
  templateUrl: './featured-deals-section.html',
})
export class FeaturedDealsSection implements OnInit {
  deals = signal<DealView[]>([]);

  constructor(private readonly dealsService: DealsService) {}

  ngOnInit(): void {
    this.dealsService.getActiveDeals().subscribe({
      next: (deals) => this.deals.set(deals),
      error: () => this.deals.set([]),
    });
  }
}
