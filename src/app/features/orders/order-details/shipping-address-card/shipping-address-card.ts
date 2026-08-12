import { Component, input } from '@angular/core';

@Component({
  selector: 'app-shipping-address-card',
  imports: [],
  templateUrl: './shipping-address-card.html',
})
export class ShippingAddressCard {
  address = input.required<string>();
}
