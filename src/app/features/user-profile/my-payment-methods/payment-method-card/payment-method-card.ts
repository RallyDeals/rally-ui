import { Component, computed, input, output } from '@angular/core';
import { PaymentMethod } from '../../../../shared/models/payment-method';


@Component({
  selector: 'app-payment-method-card',
  imports: [],
  templateUrl: './payment-method-card.html',
})
export class PaymentMethodCard {
  method = input.required<PaymentMethod>();

  setDefault = output<string>();
  deleteRequested = output<string>();

  maskedNumber = computed(() => `•••• ${this.method().cardLast4}`);
  expiryLabel = computed(() => `${this.method().cardExpMonth}/${this.method().cardExpYear}`);
}
