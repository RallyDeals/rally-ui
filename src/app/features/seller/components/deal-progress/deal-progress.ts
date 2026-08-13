import { Component, computed, input } from '@angular/core';

export type ProgressTone = 'primary' | 'secondary' | 'neutral' | 'error';

const BAR_CLASSES: Record<ProgressTone, string> = {
  primary: 'bg-primary-container',
  secondary: 'bg-secondary',
  neutral: 'bg-outline-variant',
  error: 'bg-error',
};

const TEXT_CLASSES: Record<ProgressTone, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  neutral: 'text-on-surface-variant',
  error: 'text-error',
};

@Component({
  selector: 'app-deal-progress',
  imports: [],
  templateUrl: './deal-progress.html',
})
export class DealProgress {
  joined = input.required<number>();
  required = input.required<number>();
  tone = input<ProgressTone>('primary');
  pulse = input(false);

  percent = computed(() => {
    const required = this.required();
    if (required <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((this.joined() / required) * 100));
  });

  barClass(): string {
    return BAR_CLASSES[this.tone()];
  }

  textClass(): string {
    return TEXT_CLASSES[this.tone()];
  }
}
