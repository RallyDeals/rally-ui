import { Component, input, output } from '@angular/core';

export type InsightTone = 'primary' | 'secondary' | 'inverse';

@Component({
  selector: 'app-insight-card',
  imports: [],
  templateUrl: './insight-card.html',
})
export class InsightCard {
  symbol = input.required<string>();
  title = input.required<string>();
  body = input.required<string>();
  cta = input.required<string>();
  tone = input<InsightTone>('primary');
  ctaClick = output<void>();

  cardClass(): string {
    return this.tone() === 'inverse'
      ? 'bg-inverse-surface border-outline'
      : 'bg-surface-container-lowest border-outline-variant';
  }

  iconClass(): string {
    if (this.tone() === 'inverse') {
      return 'bg-white/10 text-primary-fixed';
    }
    return this.tone() === 'secondary' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary';
  }

  titleClass(): string {
    return this.tone() === 'inverse' ? 'text-inverse-on-surface' : 'text-on-surface';
  }

  ctaClass(): string {
    return this.tone() === 'inverse' ? 'text-primary-fixed-dim' : 'text-primary';
  }
}
