import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ApiError } from '../../../../shared/models/api-error';

export type EmailTopic = 'reset-password' | 'email-verification';

const TOPIC_COPY: Record<EmailTopic, { title: string; subtitle: string; cta: string }> = {
  'reset-password': {
    title: 'Reset your password',
    subtitle: "Enter your account email and we'll send you a 6-digit reset code.",
    cta: 'Send Code',
  },
  'email-verification': {
    title: 'Verify your email',
    subtitle: "Enter the email you registered with and we'll send you a verification code.",
    cta: 'Send Code',
  },
};

/**
 * Presentational "enter your email" step shared by the forgot-password and
 * verify-email flows. The `topic` input switches the copy; the parent owns
 * the API call.
 */
@Component({
  selector: 'app-enter-email',
  imports: [FormsModule, InputTextModule, ButtonModule],
  templateUrl: './enter-email.html',
  styleUrl: './enter-email.css',
})
export class EnterEmail {
  /** Which flow this instance serves — drives title/subtitle/button copy. */
  readonly topic = input.required<EmailTopic>();

  /** Prefill (e.g. email carried over from the register page). */
  readonly initialEmail = input<string>('');

  readonly submitting = input<boolean>(false);
  readonly errorMessage = input<ApiError | null>(null);

  /** Emitted with the entered email when the form is valid. */
  readonly submitted = output<string>();

  readonly email = signal<string>(this.initialEmail());

  private readonly touched = signal(false);

  readonly emailInvalid = computed(
    () => this.touched() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()),
  );

  readonly copy = computed(() => TOPIC_COPY[this.topic()]);

  onSubmit(): void {
    this.touched.set(true);
    if (this.emailInvalid() || this.submitting()) {
      return;
    }
    this.submitted.emit(this.email().trim().toLowerCase());
  }
}
