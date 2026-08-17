import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Countdown } from '../../../../shared/components/countdown/countdown';
import { DealOverview } from '../../interfaces/DealOverview';
import { dealBadge } from '../../deal-badge';

@Component({
  selector: 'app-active-deal-card',
  imports: [RouterLink, Countdown],
  templateUrl: './deal-card.html',
})
export class ActiveDealCard {
  deal = input.required<DealOverview>();

  badge = computed(() => dealBadge(this.deal()));

  savingsPercent = computed(() => {
    const original = this.deal().originalPrice;
    if (!original || original <= 0) {
      return 0;
    }
    return Math.round((1 - this.deal().dealPrice / original) * 100);
  });

  spotsLeft = computed(() => Math.max(0, this.deal().dealStock - this.deal().currentParticipants));

  progress = computed(() => this.deal().progressPercent);
}
