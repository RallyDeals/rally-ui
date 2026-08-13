import { Component, computed, input } from '@angular/core';
import { CancelReason } from '../../../interfaces/cancel-reason';

const CANCEL_REASON_LABELS: Record<CancelReason, string> = {
  INSUFFICIENT_STOCK: 'Insufficient Stock',
  INVENTORY_UNREACHABLE: 'Inventory Unreachable',
  RESERVATION_INCOMPLETE: 'Reservation Incomplete',
  PAYMENT_DECLINED: 'Payment Declined',
  PAYMENT_TIMEOUT: 'Payment Timeout',
  DEAL_FAILED: 'Deal Failed',
  DEAL_RESOLVED: 'Deal Resolved',
  PARTICIPANT_LEFT: 'Participant Left',
  SERVER_ERROR: 'Server Error',
};

@Component({
  selector: 'app-cancel-reason-banner',
  imports: [],
  templateUrl: './cancel-reason-banner.html',
})
export class CancelReasonBanner {
  reason = input.required<CancelReason>();
  paymentErrorMessage = input<string>();

  text = computed(() => {
    const label = CANCEL_REASON_LABELS[this.reason()];
    const errorMessage = this.paymentErrorMessage();

    return this.reason() === 'PAYMENT_DECLINED' && errorMessage ? `${label} - ${errorMessage}` : label;
  });
}
