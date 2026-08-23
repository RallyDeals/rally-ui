import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Logo } from '../../../shared/components/logo/logo';
import { AuthSwitchLink } from '../components/auth-switch-link/auth-switch-link';
import { EnterEmail } from '../components/enter-email/enter-email';
import { OtpInput } from '../components/otp-input/otp-input';
import { ResendOtp } from '../components/resend-otp/resend-otp';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [Logo, AuthSwitchLink, EnterEmail, OtpInput, ResendOtp],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  /** 'email' -> ask which address; 'otp' -> enter the reset code. */
  readonly step = signal<'email' | 'otp'>('email');
  readonly email = signal('');

  readonly submitting = signal(false);
  readonly error = signal<ApiError | null>(null);

  onEmailSubmitted(email: string): void {
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.error.set(null);

    // Always 202, even for unknown emails (no enumeration).
    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.submitting.set(false);
        this.email.set(email);
        this.step.set('otp');
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(toApiError(err));
      },
    });
  }

  onResend(): void {
    this.onEmailSubmitted(this.email());
  }

  onOtpCompleted(code: string): void {
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.error.set(null);

    // Only continue to the new-password form when the OTP is valid.
    this.authService.verifyResetOtp(this.email(), code).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/auth/reset-password'], {
          state: { email: this.email(), otp: code },
        });
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(toApiError(err));
      },
    });
  }
}
