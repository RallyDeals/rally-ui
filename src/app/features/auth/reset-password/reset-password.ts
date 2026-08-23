import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Logo } from '../../../shared/components/logo/logo';
import { AuthSwitchLink } from '../components/auth-switch-link/auth-switch-link';
import { ResetPasswordForm } from '../components/reset-password-form/reset-password-form';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, Logo, AuthSwitchLink, ResetPasswordForm],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit{
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  readonly submitting = signal(false);
  readonly done = signal(false);
  readonly error = signal<ApiError | null>(null);
  email: string = '';
  otp: string = '';


  constructor() {
    const navigationState = history.state;
    if (navigationState) {
      this.email = navigationState.email;
      this.otp = navigationState.otp;
    }
    console.log(this.email,this.otp)
  }
  ngOnInit() {
    if ( !this.email === undefined || this.otp === undefined) {
      this.router.navigate(['/auth/forgot-password']);
    }
  }
onSubmitted(newPassword: string): void {
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.error.set(null);

    this.authService.resetPassword(this.email, this.otp, newPassword).subscribe({
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

}
