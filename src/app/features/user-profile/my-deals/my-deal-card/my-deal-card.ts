import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { MyDeal } from '../../interfaces/my-deal';

@Component({
  selector: 'app-my-deal-card',
  imports: [NgClass],
  templateUrl: './my-deal-card.html',
})
export class MyDealCard {
  deal = input.required<MyDeal>();
}
