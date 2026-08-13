import { Component, computed, input } from '@angular/core';
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

  display = computed(() => getErrorDisplay(this.error()));
}
