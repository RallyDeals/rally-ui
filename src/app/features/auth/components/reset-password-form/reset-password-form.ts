import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ApiError } from '../../../../shared/models/api-error';

/**
 * Presentational "new password + confirm" step used by the reset-password
 * flow (and reusable for any set-new-password screen). The parent owns the
 * API call; this component only validates and emits.
 */
@Component({
  selector: 'app-reset-password-form',
  imports: [FormsModule, PasswordModule, ButtonModule],
  templateUrl: './reset-password-form.html',
  styleUrl: './reset-password-form.css',
})
export class ResetPasswordForm {
  readonly submitting = input<boolean>(false);
  readonly errorMessage = input<ApiError | null>(null);

  /** Emitted with the new password once both fields are valid. */
  readonly submitted = output<string>();

  readonly newPassword = signal('');
  readonly confirmPassword = signal('');

  readonly touched = signal(false);

  /** Mirrors the backend policy: 8–64 chars, upper + lower + digit + special. */
  readonly policyPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

  readonly policyValid = computed(
    () =>
      this.newPassword().length >= 8 &&
      this.newPassword().length <= 64 &&
      this.policyPattern.test(this.newPassword()),
  );

  readonly passwordsMatch = computed(
    () => this.confirmPassword().length > 0 && this.newPassword() === this.confirmPassword(),
  );

  readonly formValid = computed(() => this.policyValid() && this.passwordsMatch());

  onSubmit(): void {
    this.touched.set(true);
    if (!this.formValid() || this.submitting()) {
      return;
    }
    this.submitted.emit(this.newPassword());
  }
}
