import { Component, inject, input, output, signal } from '@angular/core';
import { PaymentMethod } from '../../../../shared/models/payment-method';
import { PaymentMethodService } from '../../../../shared/services/payment-method.service';

@Component({
  selector: 'app-payment-method-picker',
  imports: [],
  templateUrl: './payment-method-picker.html',
})
export class PaymentMethodPicker {
  private readonly paymentMethodService = inject(PaymentMethodService);

  selectedId = input<string | null>(null);
  selectedIdChange = output<string>();

  methods = signal<PaymentMethod[]>([]);
  isLoading = signal(false);
  loadError = signal(false);

  isAddFormOpen = signal(false);

  constructor() {
    this.isLoading.set(true);
    this.paymentMethodService.getMyPaymentMethods().subscribe({
      next: (res) => {
        this.methods.set(res.items);
        this.isLoading.set(false);
        const defaultMethod = res.items.find((m) => m.isDefault);
        if (!this.selectedId() && defaultMethod) {
          this.selectedIdChange.emit(defaultMethod.id);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set(true);
      },
    });
  }

  select(id: string) {
    this.selectedIdChange.emit(id);
  }

  openAddForm(): void {
    this.isAddFormOpen.set(true);
  }

  closeAddForm(): void {
    this.isAddFormOpen.set(false);
  }

  onCreated(method: PaymentMethod): void {
    this.methods.update((methods) => [method, ...methods]);
    this.isAddFormOpen.set(false);
    this.selectedIdChange.emit(method.id);
  }
}
