import { Component, input } from '@angular/core';

export type MetricTrend = 'positive' | 'negative' | 'neutral';

const TREND_CLASSES: Record<MetricTrend, string> = {
  positive: 'text-secondary',
  negative: 'text-error',
  neutral: 'text-on-surface-variant',
};

const TREND_SYMBOLS: Record<MetricTrend, string> = {
  positive: 'trending_up',
  negative: 'trending_down',
  neutral: '',
};

@Component({
  selector: 'app-metric-card',
  imports: [],
  templateUrl: './metric-card.html',
})
export class MetricCard {
  label = input.required<string>();
  value = input.required<string>();
  symbol = input.required<string>();
  trend = input<MetricTrend>('neutral');
  trendLabel = input('');

  trendClass(): string {
    return TREND_CLASSES[this.trend()];
  }

  trendSymbol(): string {
    return TREND_SYMBOLS[this.trend()];
  }
}
