import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { IconButton } from '../../../shared/components/icon-button/icon-button';
import { DealStatus } from '../../../shared/models/deal';
import { DealProgress, ProgressTone } from '../components/deal-progress/deal-progress';
import { DealStatusBadge } from '../components/deal-status-badge/deal-status-badge';
import { DealsService } from '../../deals/deals.service';
import { ProductsService } from '../../products/products.service';
import { TokenService } from '../../../shared/services/token.service';
import { Product } from '../../../shared/models/product';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';
import { PLACEHOLDER_IMAGE } from '../../../shared/constants/placeholder';
import { resolveImageUrl } from '../../../shared/utils/image-url';
import { AuthService } from '../../../core/auth/auth.service';

const PROGRESS_TONES: Record<DealStatus, ProgressTone> = {
  [DealStatus.PENDING]: 'neutral',
  [DealStatus.ACTIVE]: 'primary',
  [DealStatus.SUCCEEDED]: 'secondary',
  [DealStatus.FAILED]: 'error',
  [DealStatus.CANCELLED]: 'neutral',
};

const STATUS_DESCRIPTIONS: Record<DealStatus, string> = {
  [DealStatus.PENDING]: 'This deal has not started yet and can still be edited.',
  [DealStatus.ACTIVE]: 'This deal is live and accepting participants.',
  [DealStatus.SUCCEEDED]: 'This deal reached its goal and is now closed.',
  [DealStatus.FAILED]: 'This deal did not reach its goal and is now closed.',
  [DealStatus.CANCELLED]: 'This deal was cancelled.',
};

@Component({
  selector: 'app-seller-deal-form',
  imports: [Breadcrumbs, IconButton, DealStatusBadge, DealProgress, ImageFallbackDirective],
  templateUrl: './seller-deal-form.html',
})
export class SellerDealForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly authService = inject(AuthService);
  private readonly dealsService = inject(DealsService);

  readonly DealStatus = DealStatus;
  readonly progressToneFor = (status: DealStatus): ProgressTone => PROGRESS_TONES[status];
  readonly placeholderImage = PLACEHOLDER_IMAGE;
  readonly resolveImageUrl = resolveImageUrl;

  dealId = signal<string | null>(null);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  productId = signal<string | null>(null);
  productName = signal('');
  sku = signal('');
  image = signal('');
  status = signal<DealStatus>(DealStatus.PENDING);
  dealPrice = signal('');
  originalPrice = signal('');
  dealStock = signal('');
  minParticipants = signal('');
  currentParticipants = signal(0);
  durationDays = signal('1');
  durationHours = signal('0');

  readonly isEdit = computed(() => this.dealId() !== null);

  readonly isFormDisabled = computed(
    () => this.isEdit() && (this.status() !== DealStatus.PENDING || this.currentParticipants() > 0),
  );

  readonly statusHint = computed(() => STATUS_DESCRIPTIONS[this.status()]);

  readonly lockMessage = computed<string | null>(() => {
    if (!this.isFormDisabled()) {
      return null;
    }
    if (this.currentParticipants() > 0) {
      return 'This deal already has participants joined, so it cannot be edited.';
    }
    return STATUS_DESCRIPTIONS[this.status()];
  });

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Deals', link: '/seller/deals' },
    { label: this.isEdit() ? 'Edit Deal' : 'New Deal' },
  ]);

  readonly discount = computed(() => {
    const deal = Number(this.dealPrice());
    const original = Number(this.originalPrice());
    if (!deal || !original || original <= 0) {
      return null;
    }
    return Math.round((1 - deal / original) * 100);
  });

  readonly dealPriceError = computed<string | null>(() => {
    if (this.dealPrice().trim() === '') {
      return 'Deal price is required.';
    }
    const value = Number(this.dealPrice());
    if (!Number.isFinite(value) || value <= 0) {
      return 'Deal price must be greater than 0.';
    }
    const original = Number(this.originalPrice());
    if (original > 0 && value >= original) {
      return 'Deal price must be less than the original price.';
    }
    return null;
  });

  readonly dealStockError = computed<string | null>(() => {
    if (this.dealStock().trim() === '') {
      return 'Deal stock is required.';
    }
    const value = Number(this.dealStock());
    if (!Number.isInteger(value) || value <= 0) {
      return 'Deal stock must be a whole number greater than 0.';
    }
    const min = Number(this.minParticipants());
    if (min > 0 && value < min) {
      return 'Deal stock must be at least the minimum participants.';
    }
    return null;
  });

  readonly minParticipantsError = computed<string | null>(() => {
    if (this.minParticipants().trim() === '') {
      return 'Minimum participants is required.';
    }
    const value = Number(this.minParticipants());
    if (!Number.isInteger(value) || value <= 0) {
      return 'Minimum participants must be a whole number greater than 0.';
    }
    const stock = Number(this.dealStock());
    if (stock > 0 && value > stock) {
      return 'Minimum participants cannot exceed deal stock.';
    }
    return null;
  });

  readonly percent = computed(() => {
    const stock = Number(this.dealStock());
    if (stock <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((this.currentParticipants() / stock) * 100));
  });

  formatDuration(totalMinutes: number): string {
    if (!totalMinutes || totalMinutes <= 0) {
      return '0 minutes';
    }
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    const parts: string[] = [];
    if (days) {
      parts.push(`${days} day${days > 1 ? 's' : ''}`);
    }
    if (hours) {
      parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    }
    if (minutes) {
      parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    }
    return parts.join(' and ') || '0 minutes';
  }

  readonly durationMinutes = computed<number | null>(() => {
    const days = Number(this.durationDays());
    const hours = Number(this.durationHours());
    if (!Number.isFinite(days) || !Number.isFinite(hours)) {
      return null;
    }
    const minutes = Math.round(days * 1440 + hours * 60);
    return minutes > 0 ? minutes : null;
  });

  submitted = signal(false);

  readonly durationError = computed<string | null>(() => {
    const daysRaw = this.durationDays();
    const hoursRaw = this.durationHours();
    const days = Number(daysRaw || 0);
    const hours = Number(hoursRaw || 0);
    if (!Number.isInteger(days) || days < 0 || !Number.isInteger(hours) || hours < 0) {
      return 'Duration must be whole, non-negative numbers.';
    }
    if (days === 0 && hours === 0) {
      return 'Duration must be greater than 0.';
    }
    return null;
  });

  readonly validationError = computed<string | null>(() => {
    if (!this.productId()) {
      return 'Select an approved product to continue.';
    }
    return (
      this.dealPriceError() ??
      this.dealStockError() ??
      this.minParticipantsError() ??
      this.durationError()
    );
  });

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['id'] as string | undefined;
      this.dealId.set(id ?? null);
      if (id) {
        this.loadDeal(id);
      } else {
        this.resetForm();
        this.initDefaults();
      }
    });
  }

  private initDefaults() {
    this.durationDays.set('1');
    this.durationHours.set('0');
  }

  private resetForm() {
    this.productId.set(null);
    this.productName.set('');
    this.sku.set('');
    this.image.set('');
    this.status.set(DealStatus.PENDING);
    this.dealPrice.set('');
    this.originalPrice.set('');
    this.dealStock.set('');
    this.minParticipants.set('');
    this.currentParticipants.set(0);
    this.durationDays.set('1');
    this.durationHours.set('0');
    this.error.set(null);
    this.submitted.set(false);
  }

  loadDeal(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.resetForm();
    this.dealsService.getDeal(id).subscribe({
      next: (deal) => {
        if (!deal) {
          this.error.set('Deal not found. It may have been removed.');
          this.loading.set(false);
          return;
        }
        this.productId.set(deal.productId);
        this.productName.set(deal.productName);
        this.sku.set(deal.sku);
        this.image.set(deal.productImageUrl);
        this.status.set(deal.status);
        this.dealPrice.set(String(deal.dealPrice));
        this.originalPrice.set(String(deal.originalPrice));
        this.dealStock.set(String(deal.dealStock));
        this.minParticipants.set(String(deal.minParticipants));
        this.currentParticipants.set(deal.currentParticipants);
        this.durationDays.set(String(Math.floor(deal.durationMinutes / 1440)));
        this.durationHours.set(String(Math.floor((deal.durationMinutes % 1440) / 60)));

        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load deal.');
        this.loading.set(false);
      },
    });
  }

  save = () => {
    if (this.isFormDisabled()) {
      return;
    }
    this.submitted.set(true);
    if (this.validationError()) {
      return;
    }
    const payload = {
      productId: this.productId()!,
      dealPrice: Number(this.dealPrice()),
      dealStock: Number(this.dealStock()),
      minParticipants: Number(this.minParticipants()),
      durationMinutes: this.durationMinutes() ?? 1440,
    };
    this.saving.set(true);
    const id = this.dealId();
    const request$ = id ? this.dealsService.updateDeal(id, payload) : this.dealsService.createDeal(payload);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/seller/deals']);
      },
      error: () => {
        this.error.set('Failed to save deal.');
        this.saving.set(false);
      },
    });
  };

  cancel = () => {
    this.router.navigate(['/seller/deals']);
  };

  pickerOpen = signal(false);
  pickerProducts = signal<Product[]>([]);
  pickerLoading = signal(false);
  pickerError = signal<string | null>(null);
  pickerSearch = signal('');

  readonly visiblePickerProducts = computed(() => {
    const query = this.pickerSearch().trim().toLowerCase();
    const items = this.pickerProducts();
    if (!query) {
      return items;
    }
    return items.filter(
      (product) =>
        product.name.toLowerCase().includes(query) || (product.sku ?? '').toLowerCase().includes(query),
    );
  });

  openPicker = () => {
    this.pickerOpen.set(true);
    this.pickerSearch.set('');
    this.loadPickerProducts();
  };

  closePicker = () => {
    this.pickerOpen.set(false);
  };

  loadPickerProducts() {
    const sellerId = this.authService.currentUser()?.id
    if (!sellerId) {
      this.pickerError.set('Seller account not found.');
      this.pickerLoading.set(false);
      return;
    }
    this.pickerLoading.set(true);
    this.pickerError.set(null);
    this.productsService.getSellerProducts(sellerId, { status: 'APPROVED', limit: 50 }).subscribe({
      next: (response) => {
        this.pickerProducts.set(response.items);
        this.pickerLoading.set(false);
      },
      error: () => {
        this.pickerError.set('Could not load your approved products. Please try again.');
        this.pickerLoading.set(false);
      },
    });
  }

  selectProduct = (product: Product) => {
    this.productId.set(product.id);
    this.productName.set(product.name);
    this.sku.set(product.sku ?? '');
    this.image.set(product.imageUrl ?? '');
    this.originalPrice.set(product.basePrice.toFixed(2));
    this.pickerOpen.set(false);
  };
}
