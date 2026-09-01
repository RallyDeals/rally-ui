import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../shared/models/api-error';
import { ErrorModal } from '../../../shared/components/error-modal/error-modal';
import { toApiError } from '../../../shared/utils/api-error.util';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

function notBlank(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { blank: true };
}

@Component({
  selector: 'app-security',
  imports: [ReactiveFormsModule, PasswordModule, ButtonModule, ErrorModal],
  templateUrl: './security.html',
})
export class Security {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly submitting = signal(false);
  readonly actionError = signal<ApiError | null>(null);
  readonly saved = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required, notBlank]],
      newPassword: [
        '',
        [
          Validators.required,
          notBlank,
          Validators.minLength(8),
          Validators.maxLength(64),
          Validators.pattern(PASSWORD_REGEX),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: (group) =>
        group.get('newPassword')?.value === group.get('confirmPassword')?.value
          ? null
          : { passwordMismatch: true },
    },
  );

  get passwordMismatch(): boolean {
    const confirm = this.form.controls.confirmPassword;
    return confirm.touched && this.form.hasError('passwordMismatch');
  }

  isInvalid(name: 'currentPassword' | 'newPassword' | 'confirmPassword'): boolean {
    const control = this.form.controls[name];
    return control.touched && control.invalid;
  }

  closeActionError(): void {
    this.actionError.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid || this.passwordMismatch || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.form.getRawValue();
    this.submitting.set(true);
    this.saved.set(false);

    this.authService
      .changePassword({ currentPassword: currentPassword.trim(), newPassword: newPassword.trim() })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.saved.set(true);
          this.form.reset();
        },
        error: (err) => {
          this.submitting.set(false);
          this.actionError.set(toApiError(err));
        },
      });
  }
}
