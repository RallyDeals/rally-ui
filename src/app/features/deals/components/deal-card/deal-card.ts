import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Countdown } from '../../../../shared/components/countdown/countdown';
import { DealView, progressPercent } from '../../../../shared/models/deal';
import { dealBadge } from '../../deal-badge';

@Component({
  selector: 'app-active-deal-card',
  imports: [RouterLink, Countdown],
  templateUrl: './deal-card.html',
})
export class ActiveDealCard {
  deal = input.required<DealView>();

  badge = computed(() => dealBadge(this.deal()));

  savingsPercent = computed(() => {
    const original = this.deal().originalPrice;
    if (!original || original <= 0) {
      return 0;
    }
    return Math.round((1 - this.deal().dealPrice / original) * 100);
  });

  spotsLeft = computed(() => Math.max(0, this.deal().dealStock - this.deal().currentParticipants));

  progress = computed(() => progressPercent(this.deal()));
}
