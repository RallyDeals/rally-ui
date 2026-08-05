import { Component } from '@angular/core';

interface Stat {
  value: string;
  label: string;
  colorClass: string;
}

@Component({
  selector: 'app-stats-section',
  imports: [],
  templateUrl: './stats-section.html',
})
export class StatsSection {
  stats: Stat[] = [
    { value: '$2M+', label: 'Total Saved by Community', colorClass: 'text-primary' },
    { value: '50k+', label: 'Active Users', colorClass: 'text-on-surface' },
    { value: '500+', label: 'Live Active Deals', colorClass: 'text-primary-container' },
  ];
}
