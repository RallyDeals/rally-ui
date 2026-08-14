import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Countdown } from '../../../../shared/components/countdown/countdown';
import { DealView } from '../../deals.service';

@Component({
  selector: 'app-active-deal-card',
  imports: [RouterLink, Countdown],
  templateUrl: './deal-card.html',
})
export class ActiveDealCard {
  deal = input.required<DealView>();

  savingsPercent = computed(() => {
    const original = this.deal().originalPrice;
    if (!original || original <= 0) {
      return 0;
    }
    return Math.round((1 - this.deal().dealPrice / original) * 100);
  });

  spotsLeft = computed(() => Math.max(0, this.deal().totalSpots - this.deal().joined));

  progress = computed(() => Math.min(100, Math.max(0, this.deal().progressPercent ?? 0)));
}
