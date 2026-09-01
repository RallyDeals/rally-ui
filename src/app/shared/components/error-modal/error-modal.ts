import { Component, HostListener, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiError } from '../../models/api-error';
import { getErrorDisplay } from '../../utils/error-display.util';

@Component({
  selector: 'app-error-modal',
  imports: [RouterLink],
  templateUrl: './error-modal.html',
})
export class ErrorModal {
  error = input<ApiError | null>(null);
  closed = output<void>();

  display = computed(() => {
    const error = this.error();
    return error ? getErrorDisplay(error) : null;
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.error()) {
      this.closed.emit();
    }
  }

  dismiss(): void {
    this.closed.emit();
  }
}
