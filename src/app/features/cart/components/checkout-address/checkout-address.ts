import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout-address',
  imports: [ReactiveFormsModule],
  templateUrl: './checkout-address.html',
})
export class CheckoutAddress {
  address = input.required<string>();
  addressChange = output<string>();

  onInput(value: string) {
    this.addressChange.emit(value);
  }
}
