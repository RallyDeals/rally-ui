import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

export type IconButtonTone = 'default' | 'primary' | 'error';

const TONE_CLASSES: Record<IconButtonTone, string> = {
  default: 'hover:bg-surface-container-high text-on-surface-variant',
  // primary tone should use the primary-container color (orange) by default so edit icons and similar
  // match the orange theme used elsewhere (e.g., product edit). Keep hover state to text-primary.
  primary: 'text-primary-container hover:bg-primary/10 hover:text-primary',
  error: 'hover:bg-error/10 hover:text-error text-on-surface-variant',
};

@Component({
  selector: 'app-icon-button',
  imports: [RouterLink],
  templateUrl: './icon-button.html',
})
export class IconButton {
  symbol = input.required<string>();
  label = input.required<string>();
  tone = input<IconButtonTone>('default');
  routerLink = input<string | string[]>();
  click = output<MouseEvent>();

  buttonClass(): string {
    return TONE_CLASSES[this.tone()];
  }
}
