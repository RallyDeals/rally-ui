import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Logo } from '../../../shared/components/logo/logo';
import { AuthSwitchLink } from '../components/auth-switch-link/auth-switch-link';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { InputPassword } from 'primeng/inputpassword';

type RegisterRole = 'BUYER' | 'SELLER';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    Logo,
    AuthSwitchLink,
    InputPassword,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly error = signal<ApiError | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(64),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/),
        ],
      ],
      confirmPassword: ['', Validators.required],
      role: ['BUYER' as RegisterRole, Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
    },
    {
      validators: (group) =>
        group.get('password')?.value === group.get('confirmPassword')?.value
          ? null
          : { passwordMismatch: true },
    },
  );

  get passwordMismatch(): boolean {
    const confirm = this.form.controls.confirmPassword;
    return confirm.touched && (confirm.invalid || this.form.hasError('passwordMismatch'));
  }

  get termsNotAccepted(): boolean {
    return this.form.controls.acceptTerms.touched && this.form.controls.acceptTerms.invalid;
  }

  selectRole(role: RegisterRole): void {
    this.form.patchValue({ role });
  }

  get selectedRole(): RegisterRole {
    return this.form.getRawValue().role;
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);

    // Only send the fields the API expects (no confirmPassword/acceptTerms).
    const { firstName, lastName, email, password, role } = this.form.getRawValue();
    this.authService.register({ firstName, lastName, email, password, role }).subscribe({
      next: () => {
        this.router.navigate(['/auth/verify-email'], {
          queryParams: { email: this.form.getRawValue().email },
        });
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(toApiError(err));
      },
    });
  }
}
