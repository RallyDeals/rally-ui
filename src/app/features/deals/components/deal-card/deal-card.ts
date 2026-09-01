import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Countdown } from '../../../../shared/components/countdown/countdown';
import { resolveImageUrl } from '../../../../shared/utils/image-url';
import { DealOverview } from '../../interfaces/deal-overview';
import { dealBadge } from '../../deal-badge';
import { DealStatus } from '../../../../shared/models/deal';

@Component({
  selector: 'app-active-deal-card',
  imports: [RouterLink, Countdown],
  templateUrl: './deal-card.html',
})
export class ActiveDealCard {
  deal = input.required<DealOverview>();
  readonly resolveImageUrl = resolveImageUrl;

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

  isPending = computed(() => this.deal().status === DealStatus.PENDING);
}
