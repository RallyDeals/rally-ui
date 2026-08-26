import { Component, computed, input, output } from '@angular/core';
import { PaymentMethod } from '../../../../shared/models/payment-method';


@Component({
  selector: 'app-payment-method-card',
  imports: [],
  styleUrl: './payment-method-card.css',
  templateUrl: './payment-method-card.html',
})
export class PaymentMethodCard {
  method = input.required<PaymentMethod>();

  cardBrand = computed(() => `${this.method().cardBrand}`);
  cardLast4 = computed(() => `${this.method().cardLast4}`);
  cardExpMonth = computed(() => `${this.method().cardExpMonth}`);
  cardExpYear = computed(() => `${this.method().cardExpYear}`);
  isDefault = computed(() => this.method().isDefault);
  setDefault = output<string>();
  deleteRequested = output<string>();

  maskedNumber = computed(() => `•••• ${this.method().cardLast4}`);
  expiryLabel = computed(() => `${this.method().cardExpMonth}/${this.method().cardExpYear}`);


    getCardBrandClass(brand: string): string {
    const b = brand.toUpperCase();
    if (b.includes('VISA')) return 'card-brand-visa';
    if (b.includes('MASTERCARD')) return 'card-brand-mastercard';
    if (b.includes('AMEX')) return 'card-brand-amex';
    return 'card-brand-default';
  }

  getCardBrandLabel(brand: string): string {
    const b = brand.toUpperCase();
    if (b.includes('VISA')) return 'VISA';
    if (b.includes('MASTERCARD')) return 'MC';
    if (b.includes('AMEX')) return 'AMEX';
    return brand.slice(0, 4).toUpperCase();
  }
}
