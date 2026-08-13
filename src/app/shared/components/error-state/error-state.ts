import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiError } from '../../models/api-error';
import { getErrorDisplay } from '../../utils/error-display.util';

@Component({
  selector: 'app-error-state',
  imports: [RouterLink],
  templateUrl: './error-state.html',
})
export class ErrorState {
  error = input.required<ApiError>();
  showRetry = input(false);
  retry = output<void>();

  display = computed(() => getErrorDisplay(this.error()));
}
