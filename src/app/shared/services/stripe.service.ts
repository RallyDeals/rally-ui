import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StripeService {
  private stripePromise: Promise<Stripe | null> | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;

  private getStripe(): Promise<Stripe | null> {
    if (!this.stripePromise) {
      this.stripePromise = loadStripe(environment.stripePublishableKey);
    }
    return this.stripePromise;
  }

  async createCardElement(container: HTMLElement): Promise<StripeCardElement> {
    const stripe = await this.getStripe();
    if (!stripe) throw new Error('Stripe failed to load');

    this.elements = stripe.elements({
      clientSecret: undefined,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#f97316',
          borderRadius: '8px',
        },
      },
    });

    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#1a1a2e',
          '::placeholder': { color: '#8892b0' },
        },
        invalid: { color: '#dc2626' },
      },
    });

    this.cardElement.mount(container);
    return this.cardElement;
  }

  async confirmSetup(clientSecret: string): Promise<{ setupIntentId: string; paymentMethodId: string }> {
    const stripe = await this.getStripe();
    if (!stripe) throw new Error('Stripe failed to load');
    if (!this.cardElement) throw new Error('Card element not mounted');

    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: this.cardElement },
    });

    if (result.error) throw new Error(result.error.message);

    const setupIntent = result.setupIntent;
    const pmId = typeof setupIntent.payment_method === 'string'
      ? setupIntent.payment_method
      : (setupIntent.payment_method as any)?.id;

    return { setupIntentId: setupIntent.id, paymentMethodId: pmId };
  }

  destroyCardElement(): void {
    if (this.cardElement) {
      this.cardElement.unmount();
      this.cardElement = null;
    }
    this.elements = null;
  }
}
