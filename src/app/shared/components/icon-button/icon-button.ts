import { Component, input, output } from '@angular/core';

export type IconButtonTone = 'default' | 'primary' | 'error';

const TONE_CLASSES: Record<IconButtonTone, string> = {
  default: 'hover:bg-surface-container-high text-on-surface-variant',
  primary: 'hover:bg-primary/10 hover:text-primary text-on-surface-variant',
  error: 'hover:bg-error/10 hover:text-error text-on-surface-variant',
};

@Component({
  selector: 'app-icon-button',
  imports: [],
  templateUrl: './icon-button.html',
})
export class IconButton {
  symbol = input.required<string>();
  label = input.required<string>();
  tone = input<IconButtonTone>('default');
  click = output<MouseEvent>();

  buttonClass(): string {
    return TONE_CLASSES[this.tone()];
  }
}
