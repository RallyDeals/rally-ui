import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { DealStat } from '../../interfaces/deal-stat';

@Component({
  selector: 'app-stat-card',
  imports: [NgClass],
  templateUrl: './stat-card.html',
})
export class StatCard {
  stat = input.required<DealStat>();
}
