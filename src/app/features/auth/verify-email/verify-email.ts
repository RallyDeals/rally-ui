import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Logo } from '../../../shared/components/logo/logo';
import { AuthSwitchLink } from '../components/auth-switch-link/auth-switch-link';
import { EnterEmail } from '../components/enter-email/enter-email';
import { OtpInput } from '../components/otp-input/otp-input';
import { ResendOtp } from '../components/resend-otp/resend-otp';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [Logo, AuthSwitchLink, EnterEmail, OtpInput, ResendOtp, ButtonModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  /** Arriving with ?email=... from register means the OTP was already sent. */
  readonly email = signal<string>(this.route.snapshot.queryParamMap.get('email') ?? '');
  readonly step = signal<'email' | 'otp'>(this.email() ? 'otp' : 'email');

  readonly submitting = signal(false);
  readonly done = signal(false);
  readonly error = signal<ApiError | null>(null);

  onEmailSubmitted(email: string): void {
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.error.set(null);

    // Always 202, even for unknown emails (no enumeration).
    this.authService.resendVerificationOtp(email).subscribe({
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

  onOtpCompleted(code: string): void {
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.error.set(null);

    // Logs the user in on success (token pair stored by the service).
    this.authService.verifyEmail({ email: this.email(), otp: code }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.done.set(true);
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

  continueAfterVerify(): void {
    const role = this.authService.role();
    if (role === 'ADMIN') {
      this.router.navigateByUrl('/admin');
    } else if (role === 'SELLER') {
      this.router.navigateByUrl('/seller');
    } else {
      this.router.navigateByUrl('/');
    }
  }
}
