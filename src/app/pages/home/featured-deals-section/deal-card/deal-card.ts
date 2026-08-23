import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DealOverview } from '../../../../features/deals/interfaces/DealOverview';
import { dealBadge } from '../../../../features/deals/deal-badge';

@Component({
  selector: 'app-deal-card',
  imports: [RouterLink],
  templateUrl: './deal-card.html',
  styleUrl: './deal-card.css',
})
export class DealCard {
  deal = input.required<DealOverview>();
  extraClasses = input('');
  badge = computed(() => dealBadge(this.deal()));
}
