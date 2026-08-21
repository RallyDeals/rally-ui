import { Component, ElementRef, inject, output, signal, ViewChild } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {  loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { PaymentMethodService } from '../../../../shared/services/payment-method.service';
import { PaymentMethod } from '../../../../shared/models/payment-method';


@Component({
  selector: 'app-stripe-card-form',
  imports: [FormsModule],
  templateUrl: './stripe-card-form.html'
})
export class StripeCardForm implements AfterViewInit {

  @ViewChild("cardElementRef") cardTarget!: ElementRef;

  private paymentMethodService = inject(PaymentMethodService);

  createdPaymentMethod = output<PaymentMethod>();

  formIsClosed = output<void>();

  isSubmitting = signal(false);

  errorMessage = signal<string | null>(null);

  private strip: null | Stripe = null;

  private card: null | StripeCardElement = null;


  async ngAfterViewInit() {

    this.strip = await loadStripe(environment.stripePublishableKey);

    if (!this.strip) {
           this.errorMessage.set(`Stripe failed to load.`);
    return;
    }

    this.card = this.strip.elements().create('card');

    this.card.mount(this.cardTarget.nativeElement);

  }


  async onSubmit() {
    this.isSubmitting.set(true)
    this.errorMessage.set(null);

    try {
      // Get Setup Intent : ClientSecret

      const clientSecertResult = await firstValueFrom(this.paymentMethodService.createSetupIntent())

      if (!clientSecertResult) {
        this.errorMessage.set("An error has been occured")
        console.log("client secret failed");
        return;
      }

      const { setupIntent, error } = await
        this.strip!.confirmCardSetup(clientSecertResult.clientSecret, {
    payment_method: { card: this.card! },
        });

      if (error)
      {
        this.errorMessage.set(error.message ?? "Could noy save card")
                console.log("Could noy save card");

        return;
      }

      const createdPaymentMethod = await firstValueFrom(this.paymentMethodService.createPaymentMethod({paymentMethodId: setupIntent.payment_method as string, isDefault: false}));

      this.createdPaymentMethod.emit(createdPaymentMethod)
      this.formIsClosed.emit();


    }
    catch(ex) {
    this.errorMessage.set('Could not start card setup.');

    }
    finally {
      this.isSubmitting.set(false);
    }
}

}
