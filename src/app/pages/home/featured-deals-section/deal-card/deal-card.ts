import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DealView, neededCount, progressPercent } from '../../../../shared/models/deal';
import { dealBadge } from '../../../../features/deals/deal-badge';

@Component({
  selector: 'app-deal-card',
  imports: [RouterLink],
  templateUrl: './deal-card.html',
  styleUrl: './deal-card.css',
})
export class DealCard {
  deal = input.required<DealView>();
  extraClasses = input('');

  badge = computed(() => dealBadge(this.deal()));

  needed = computed(() => neededCount(this.deal()));

  progress = computed(() => progressPercent(this.deal()));
}
