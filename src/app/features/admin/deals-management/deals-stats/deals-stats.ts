import { Component, input } from '@angular/core';

@Component({
  selector: 'app-deals-stats',
  imports: [],
  templateUrl: './deals-stats.html',
})
export class DealsStats {
  totalDeals = input.required<number>();
  dealsCreatedThisMonth = input.required<number>();
  activeDeals = input.required<number>();
  dealsCreatedToday = input.required<number>();
  completedDeals = input.required<number>();
  successRate = input.required<number>();
}
