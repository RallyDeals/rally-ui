import { Component, OnDestroy, OnInit, inject, input, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';

const COOLDOWN_SECONDS = 60;

/**
 * "Didn't get the code?" row with a 60s cooldown between resends.
 * The parent owns the API call; this component only enforces the timer.
 */
@Component({
  selector: 'app-resend-otp',
  imports: [ButtonModule],
  template: `
    <div class="flex items-center justify-center gap-2 mt-rally-md">
      <span class="font-label-sm text-label-sm text-on-surface-variant">
        Didn't receive a code?
      </span>
      @if (cooldown() > 0) {
        <span class="font-label-sm text-label-sm text-on-surface-variant">
          Resend in {{ cooldown() }}s
        </span>
      } @else {
        <p-button
          type="button"
          label="Resend code"
          variant="text"
          size="small"
          [loading]="submitting()"
          [disabled]="submitting()"
          (onClick)="onResend()"
        />
      }
    </div>
  `,
})
export class ResendOtp implements OnInit, OnDestroy {
  readonly submitting = input<boolean>(false);
  readonly resent = output<void>();

  readonly cooldown = signal(COOLDOWN_SECONDS);
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.startCooldown();
  }

  ngOnDestroy(): void {
    this.stopCooldown();
  }

  onResend(): void {
    if (this.cooldown() > 0 || this.submitting()) {
      return;
    }
    this.resent.emit();
    this.startCooldown();
  }

  private startCooldown(): void {
    this.stopCooldown();
    this.cooldown.set(COOLDOWN_SECONDS);
    this.timer = setInterval(() => {
      const next = this.cooldown() - 1;
      this.cooldown.set(next);
      if (next <= 0) {
        this.stopCooldown();
      }
    }, 1000);
  }

  private stopCooldown(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
