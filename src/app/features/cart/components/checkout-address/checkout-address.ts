import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-checkout-address',
  imports: [],
  templateUrl: './checkout-address.html',
})
export class CheckoutAddress {
  address = input.required<string>();
  addressChange = output<string>();

  onInput(value: string) {
    this.addressChange.emit(value);
  }
}
