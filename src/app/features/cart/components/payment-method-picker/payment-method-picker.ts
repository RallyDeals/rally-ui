import { Component, input, output } from '@angular/core';
import { SavedPaymentMethod } from '../../interfaces/saved-payment-method';

const MOCK_PAYMENT_METHODS: SavedPaymentMethod[] = [
  { id: 'pm-1', brand: 'VISA', lastFourDigits: '4242', expiry: '12/26' },
  { id: 'pm-2', brand: 'MASTERCARD', lastFourDigits: '8210', expiry: '09/27' },
];

@Component({
  selector: 'app-payment-method-picker',
  imports: [],
  templateUrl: './payment-method-picker.html',
})
export class PaymentMethodPicker {
  selectedId = input<string | null>(null);
  selectedIdChange = output<string>();

  methods = MOCK_PAYMENT_METHODS;

  select(id: string) {
    this.selectedIdChange.emit(id);
  }
}
