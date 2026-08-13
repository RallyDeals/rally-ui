import { Component, input } from '@angular/core';

export type StatTone = 'primary' | 'secondary' | 'error' | 'tertiary' | 'neutral';

const TONE_CLASSES: Record<StatTone, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  error: 'bg-error/10 text-error',
  tertiary: 'bg-tertiary-container text-on-tertiary-container',
  neutral: 'bg-surface-container text-on-surface-variant',
};

@Component({
  selector: 'app-stat-card',
  imports: [],
  templateUrl: './stat-card.html',
})
export class StatCard {
  label = input.required<string>();
  value = input.required<string>();
  symbol = input.required<string>();
  tone = input<StatTone>('primary');

  iconClass(): string {
    return TONE_CLASSES[this.tone()];
  }
}
