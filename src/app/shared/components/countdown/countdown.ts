import { Component, computed, input, OnDestroy, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-countdown',
  imports: [],
  templateUrl: './countdown.html',
})
export class Countdown implements OnInit, OnDestroy {
  endAt = input.required<string>();
  showIcon = input(true);

  private now = signal(Date.now());
  private timer?: ReturnType<typeof setInterval>;

  remaining = computed(() => Math.max(0, new Date(this.endAt()).getTime() - this.now()));

  parts = computed(() => {
    const total = Math.floor(this.remaining() / 1000);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return { days, hours, minutes, seconds };
  });

  expired = computed(() => this.remaining() <= 0);

  label = computed(() => {
    const { days, hours, minutes, seconds } = this.parts();
    if (days > 0) {
      return `${days}d : ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h : ${minutes}m`;
    }
    return `${minutes}m : ${seconds}s`;
  });

  ngOnInit(): void {
    this.timer = setInterval(() => this.now.set(Date.now()), 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
