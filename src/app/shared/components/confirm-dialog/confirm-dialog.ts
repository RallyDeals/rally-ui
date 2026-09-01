import { Component, HostListener, computed, input, output } from '@angular/core';

export type ConfirmDialogTone = 'error' | 'primary';

export interface ConfirmDialogRequest {
  title?: string;
  message?: string;
  icon?: string;
  iconTone?: 'error' | 'primary' | 'default';
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: ConfirmDialogTone;
}

export interface ConfirmDialogDisplay {
  title: string;
  message: string;
  icon: string;
  iconClass: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmClass: string;
}

const DEFAULTS: Omit<ConfirmDialogDisplay, 'confirmClass' | 'iconClass'> = {
  title: 'Are you sure?',
  message: 'Do you want to proceed?',
  icon: 'warning',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
};

const ICON_CLASSES: Record<NonNullable<ConfirmDialogRequest['iconTone']>, string> = {
  error: 'text-error',
  primary: 'text-primary',
  default: 'text-on-surface-variant',
};

const CONFIRM_CLASSES: Record<ConfirmDialogTone, string> = {
  error: 'bg-error text-on-error hover:bg-error/90',
  primary: 'bg-primary text-on-primary hover:bg-primary/90',
};

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  confirm = input<ConfirmDialogRequest | null>(null);
  confirmed = output<void>();
  closed = output<void>();

  display = computed<ConfirmDialogDisplay | null>(() => {
    const request = this.confirm();
    if (!request) {
      return null;
    }
    const confirmTone: ConfirmDialogTone = request.confirmTone ?? 'error';
    return {
      title: request.title ?? DEFAULTS.title,
      message: request.message ?? DEFAULTS.message,
      icon: request.icon ?? DEFAULTS.icon,
      iconClass: ICON_CLASSES[request.iconTone ?? 'error'],
      confirmLabel: request.confirmLabel ?? DEFAULTS.confirmLabel,
      cancelLabel: request.cancelLabel ?? DEFAULTS.cancelLabel,
      confirmClass: CONFIRM_CLASSES[confirmTone],
    };
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.confirm()) {
      this.closed.emit();
    }
  }

  dismiss(): void {
    this.closed.emit();
  }

  confirmAction(): void {
    this.confirmed.emit();
  }
}
