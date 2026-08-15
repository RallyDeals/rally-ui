import { Component, input } from '@angular/core';

@Component({
  selector: 'app-seller-stats',
  imports: [],
  templateUrl: './seller-stats.html',
})
export class SellerStats {
  totalSellers = input.required<number>();
  pendingReview = input.required<number>();
  activeDeals = input.required<number>();
}
