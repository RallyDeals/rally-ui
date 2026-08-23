import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Logo } from '../../../shared/components/logo/logo';
import { AuthSwitchLink } from '../components/auth-switch-link/auth-switch-link';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { InputPassword } from 'primeng/inputpassword';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    RouterLink,
    Logo,
    AuthSwitchLink,
    InputPassword,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly rememberMe = signal<true | false>(false);

  readonly submitting = signal(false);
  readonly error = signal<ApiError | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onChecked($event: Event) {
    this.rememberMe.set(!this.rememberMe());
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);

    this.authService.login(this.form.getRawValue(), this.rememberMe()).subscribe({
      next: (response) => {
        console.log(response);
        if (response.user.role === 'ADMIN') this.router.navigateByUrl('admin');
        else if (response.user.role === 'SELLER') this.router.navigateByUrl('seller');
        else this.router.navigateByUrl(`/`);
      },
      error: (err) => {
        console.log(err);
        this.submitting.set(false);
        const apiError = toApiError(err);

        // Unverified email -> continue the verification flow instead of an error banner.
        if (apiError.status === 403 && /verif/i.test(apiError.message)) {
          this.authService.resendVerificationOtp(this.form.getRawValue().email);
          this.router.navigate(['/auth/verify-email'], {
            queryParams: { email: this.form.getRawValue().email },
          });
          return;
        }
        this.error.set(apiError);
      },
    });
  }
}
