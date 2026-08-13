import { Component, input } from '@angular/core';
import { PaymentMethod } from '../../interfaces/payment-method';

@Component({
  selector: 'app-payment-method-card',
  imports: [],
  templateUrl: './payment-method-card.html',
})
export class PaymentMethodCard {
  method = input.required<PaymentMethod>();
}
