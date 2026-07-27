import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Deal } from '../../../core/models/deal';

@Component({
  selector: 'app-deal-card',
  imports: [RouterLink],
  templateUrl: './deal-card.html',
})
export class DealCard {
  deal = input.required<Deal>();
  extraClasses = input('');
}
