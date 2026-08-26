import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { StatCardInfo } from '../../interfaces/stat-card-info';

@Component({
  selector: 'app-stat-card',
  imports: [NgClass],
  templateUrl: './stat-card.html',
})
export class StatCard {
  stat = input.required<StatCardInfo>();
}
