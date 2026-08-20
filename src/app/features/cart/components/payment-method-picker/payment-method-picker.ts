import { Component, AfterViewInit, OnDestroy, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { PaymentMethodService, SavedPaymentMethod } from '../../../../shared/services/payment-method.service';
import { StripeService } from '../../../../shared/services/stripe.service';

@Component({
  selector: 'app-payment-method-picker',
  imports: [],
  templateUrl: './payment-method-picker.html',
  styles: `
    .card-brand-visa { background: linear-gradient(135deg, #1a1f71, #2557d6); }
    .card-brand-mastercard { background: linear-gradient(135deg, #eb001b, #f79e1b); }
    .card-brand-amex { background: linear-gradient(135deg, #006fcf, #00aeef); }
    .card-brand-default { background: linear-gradient(135deg, #64748b, #94a3b8); }
  `,
})
export class PaymentMethodPicker implements AfterViewInit, OnDestroy {
  selectedId = input<string | null>(null);
  selectedIdChange = output<string>();

  private readonly paymentMethodService = inject(PaymentMethodService);
  private readonly stripeService = inject(StripeService);

  cardContainer = viewChild<ElementRef<HTMLDivElement>>('cardElementContainer');

  methods = signal<SavedPaymentMethod[]>([]);
  loading = signal(true);
  addingNewCard = signal(false);
  savingCard = signal(false);
  error = signal<string | null>(null);

  ngAfterViewInit(): void {
    this.loadSavedCards();
  }

  ngOnDestroy(): void {
    this.stripeService.destroyCardElement();
  }

  private loadSavedCards(): void {
    this.loading.set(true);
    this.paymentMethodService.listSavedCards().subscribe({
      next: (cards) => {
        this.methods.set(cards);
        this.loading.set(false);
        if (cards.length > 0 && !this.selectedId()) {
          const defaultCard = cards.find((c) => c.isDefault) ?? cards[0];
          this.select(defaultCard.id);
        }
      },
      error: () => {
        this.methods.set([]);
        this.loading.set(false);
      },
    });
  }

  select(id: string) {
    this.selectedIdChange.emit(id);
    this.addingNewCard.set(false);
    this.stripeService.destroyCardElement();
    this.error.set(null);
  }

  showAddCard(): void {
    this.addingNewCard.set(true);
    this.error.set(null);
    setTimeout(() => {
      const container = this.cardContainer()?.nativeElement;
      if (container) {
        this.stripeService.createCardElement(container).catch((err: any) => {
          this.error.set(err.message || 'Failed to load card form');
        });
      }
    }, 100);
  }

  cancelAddCard(): void {
    this.addingNewCard.set(false);
    this.stripeService.destroyCardElement();
    this.error.set(null);
    if (this.methods().length > 0 && !this.selectedId()) {
      this.select(this.methods()[0].id);
    }
  }

  async saveNewCard(): Promise<void> {
    this.savingCard.set(true);
    this.error.set(null);
    try {
      const setupIntent = await this.paymentMethodService.createSetupIntent().toPromise();
      if (!setupIntent) throw new Error('Failed to start card setup');

      const result = await this.stripeService.confirmSetup(setupIntent.clientSecret);
      const saved = await this.paymentMethodService.confirmAndSave(result.paymentMethodId).toPromise();
      if (!saved) throw new Error('Failed to save card');

      this.methods.update((cards) => [...cards, saved]);
      this.addingNewCard.set(false);
      this.stripeService.destroyCardElement();
      this.select(saved.id);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to save card');
    } finally {
      this.savingCard.set(false);
    }
  }

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
