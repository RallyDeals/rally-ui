import { Component, inject, signal } from '@angular/core';
import { PaymentMethodCard } from "./payment-method-card/payment-method-card";
import { StripeCardForm } from "./stripe-card-form/stripe-card-form";
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { PaymentMethod } from '../../../shared/models/payment-method';
import { PaymentMethodService } from '../../../shared/services/payment-method.service';

@Component({
  selector: 'app-payment-methods',
  imports: [PaymentMethodCard, StripeCardForm, ErrorState],
  templateUrl: './my-payment-methods.html'
})
export class PaymentMethods {
  private paymentMethodService = inject(PaymentMethodService);
  paymentMethods = signal<PaymentMethod[]>([]);
  pms = this.paymentMethods.asReadonly();

  isAddFormOpen = signal(false);


isLoading = signal(false);
loadError = signal<ApiError | null>(null);

constructor() {
 this.isLoading.set(true);
  this.paymentMethodService.getMyPaymentMethods().subscribe({
    next: (paymentMethodListResponse) => {
      this.paymentMethods.set(paymentMethodListResponse.items);
      this.isLoading.set(false);
    },
    error: (err) => {
      this.isLoading.set(false);
      this.loadError.set(toApiError(err));
    },
  });

}

openAddForm(): void { this.isAddFormOpen.set(true); }
closeAddForm(): void { this.isAddFormOpen.set(false); }
onCreated(method: PaymentMethod): void {
  this.paymentMethods.update((methods) => [method, ...methods]);
  this.isAddFormOpen.set(false);
}

onSetDefault(id: string): void {
  this.paymentMethodService.setDefault(id).subscribe((updated) => {
    this.paymentMethods.update((methods) =>
      methods.map((m) => ({ ...m, isDefault: m.id === updated.id })),
    );
  });
}

onDelete(id: string): void {
  this.paymentMethodService.deletePaymentMethod(id).subscribe(() => {
    this.paymentMethods.update((methods) => methods.filter((m) => m.id !== id));
  });
}
}
