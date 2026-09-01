import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Output,
  AfterViewInit,
  OnDestroy,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaymentMethodService } from '../../services/payment-method.service';
import { StripeService } from '../../services/stripe.service';
import { firstValueFrom } from 'rxjs';
import { PaymentMethod } from '../../models/payment-method';


@Component({
  selector: 'app-payment-dialog',
  imports: [FormsModule],
  templateUrl: './payment-dialog.html',
  styleUrl: './payment-dialog.css',
})
export class PaymentDialog implements AfterViewInit, OnDestroy {
  @Output() confirmed = new EventEmitter<{ paymentMethodId: string; address: string }>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly paymentMethodService = inject(PaymentMethodService);
  private readonly stripeService = inject(StripeService);
  private readonly destroyRef = inject(DestroyRef);

  cardContainer = viewChild<ElementRef<HTMLDivElement>>('cardElementContainer');

  savedCards = signal<PaymentMethod[]|null>(null);
  selectedCardId = signal<string | null>(null);
  addingNewCard = signal(false);
  loading = signal(true);
  processing = signal(false);
  error = signal<string | null>(null);

  address = '';

  ngAfterViewInit(): void {
    this.loadSavedCards();
  }

  ngOnDestroy(): void {
    this.stripeService.destroyCardElement();
  }

  private loadSavedCards(): void {
    this.loading.set(true);
    this.paymentMethodService.getMyPaymentMethods().subscribe({
      next: (cards) => {
        if (cards.items.length > 0) {
          this.savedCards.set(cards.items);
          const defaultCard = cards.items.find((c) => c.isDefault);
          if (defaultCard) {
            this.selectedCardId.set(defaultCard.id);
          } else {
            this.selectedCardId.set(cards.items[0].id);
          }
        }
        this.loading.set(false);
      },
      error: (e) => {
        console.log(e);
        this.loading.set(false);
      },
    });
  }

  selectCard(id: string): void {
    this.selectedCardId.set(id);
    this.addingNewCard.set(false);
    this.stripeService.destroyCardElement();
    this.error.set(null);
  }

  showAddCard(): void {
    this.addingNewCard.set(true);
    this.selectedCardId.set(null);
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
    if (this.savedCards() && this.savedCards()!.length > 0) {
      this.selectedCardId.set(this.savedCards()![0].id);
    }
  }

  async confirm(): Promise<void> {
    if (!this.address.trim()) {
      this.error.set('Please enter a shipping address');
      return;
    }

    this.processing.set(true);
    this.error.set(null);

    try {
      if (this.addingNewCard()) {
        const setupIntent = await firstValueFrom(this.paymentMethodService.createSetupIntent());
        if (!setupIntent) throw new Error('Failed to start card setup');

        const result = await this.stripeService.confirmSetup(setupIntent.clientSecret);
        const saved = await firstValueFrom(this.paymentMethodService.createPaymentMethod({paymentMethodId:result.paymentMethodId,isDefault:true}));
        if (!saved) throw new Error('Failed to save card');

        this.confirmed.emit({ paymentMethodId: saved.id, address: this.address.trim() });
      } else {
        const cardId = this.selectedCardId();
        if (!cardId) {
          this.error.set('Please select a payment method');
          this.processing.set(false);
          return;
        }
        this.confirmed.emit({ paymentMethodId: cardId, address: this.address.trim() });
      }
    } catch (err: any) {
      this.error.set(err.message || 'Payment setup failed');
      this.processing.set(false);
    }
  }

  cancel(): void {
    this.stripeService.destroyCardElement();
    this.cancelled.emit();
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
