import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { IconButton } from '../../../shared/components/icon-button/icon-button';
import { DealStatus, DealStatusBadge } from '../components/deal-status-badge/deal-status-badge';
import { DealProgress, ProgressTone } from '../components/deal-progress/deal-progress';
import { DEALS } from '../seller-deals/seller-deals';
import { ProductsService } from '../../products/products.service';
import { TokenService } from '../../../shared/services/token.service';
import { Product } from '../../../shared/models/product';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';
import { PLACEHOLDER_IMAGE } from '../../../shared/constants/placeholder';
import { resolveImageUrl } from '../../../shared/utils/image-url';

const PROGRESS_TONES: Record<DealStatus, ProgressTone> = {
  pending: 'neutral',
  active: 'primary',
  succeeded: 'secondary',
  failed: 'error',
  cancelled: 'neutral',
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
  private readonly tokenService = inject(TokenService);

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
  status = signal<DealStatus>('pending');
  dealPrice = signal('');
  originalPrice = signal('');
  dealStock = signal('');
  minParticipants = signal('');
  currentParticipants = signal(0);
  startAt = signal('');
  endAt = signal('');

  // User-editable duration input (minutes). Kept in sync with startAt/endAt.
  durationMinutesInput = signal<number | null>(null);

  readonly isEdit = computed(() => this.dealId() !== null);

  // Disable the form when deal is not pending or when there are no buyers joined
  readonly isFormDisabled = computed(() => this.status() !== 'pending' || this.currentParticipants() === 0);

  readonly statusHint = computed(() => {
    switch (this.status()) {
      case 'pending':
        return 'Created. Becomes active automatically once the first buyer joins.';
      case 'active':
        return 'Live — buyers can join. Ends when the stock sells out or time runs out.';
      case 'succeeded':
        return 'Deal stock was sold. Buyers are being fulfilled at the deal price.';
      case 'failed':
        return 'Ended before reaching the minimum participants. Buyers were not charged.';
      case 'cancelled':
        return 'Cancelled before it started. Only possible while no one has joined yet.';
    }
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
    const start = this.startAt();
    const end = this.endAt();
    if (!start || !end) {
      return null;
    }
    const ms = Date.parse(end) - Date.parse(start);
    if (Number.isNaN(ms) || ms <= 0) {
      return null;
    }
    return Math.round(ms / 60000);
  });

  submitted = signal(false);

  readonly startAtError = computed<string | null>(() => {
    const value = this.startAt();
    if (!value) {
      return 'Start time is required.';
    }
    const start = new Date(value);
    if (Number.isNaN(start.getTime())) {
      return 'Invalid start time.';
    }
    const now = new Date();

    const sameDay =
      start.getFullYear() === now.getFullYear() &&
      start.getMonth() === now.getMonth() &&
      start.getDate() === now.getDate();

    if (!sameDay) {
      return start.getTime() < now.getTime() ? 'Start time cannot be in the past.' : null;
    }

    if (start.getHours() < now.getHours()) {
      return 'Start time cannot be in the past.';
    }
    if (start.getHours() === now.getHours() && start.getMinutes() <= now.getMinutes()) {
      return 'Start time must be at least one minute ahead.';
    }
    return null;
  });

  readonly endAtError = computed<string | null>(() => {
    const start = this.startAt();
    const end = this.endAt();
    if (!end) {
      return 'End time is required.';
    }
    if (start && Date.parse(end) <= Date.parse(start)) {
      return 'End time must be after the start time.';
    }
    return null;
  });

  readonly validationError = computed<string | null>(() => {
    if (!this.productId()) {
      return 'Select an approved product to continue.';
    }
    return this.startAtError() ?? this.endAtError();
  });

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['id'] as string | undefined;
      this.dealId.set(id ?? null);
      if (id) {
        this.loadDeal(id);
      }
    });
  }

  loadDeal(id: string) {
    this.loading.set(true);
    this.error.set(null);
    const deal = DEALS.find((d) => d.id === id);
    if (!deal) {
      this.error.set('Deal not found. It may have been removed.');
      this.loading.set(false);
      return;
    }
    this.productId.set(deal.id);
    this.productName.set(deal.name);
    this.image.set(deal.image);
    this.status.set(deal.status);
    this.dealPrice.set(deal.price);
    this.originalPrice.set(deal.originalPrice);
    this.dealStock.set(String(deal.dealStock));
    this.minParticipants.set(String(deal.minParticipants));
    this.currentParticipants.set(deal.currentParticipants);

    // Initialize startAt/endAt and duration from deal data when available.
    // Convert deal.startTime (ISO) to datetime-local format (no seconds) for inputs.
    const startDate = deal.startTime ? new Date(deal.startTime) : null;
    if (startDate && !Number.isNaN(startDate.getTime())) {
      this.startAt.set(this.formatToDatetimeLocal(startDate));
      if (typeof deal.durationMinutes === 'number' && deal.durationMinutes > 0) {
        const endDate = new Date(startDate.getTime() + deal.durationMinutes * 60000);
        this.endAt.set(this.formatToDatetimeLocal(endDate));
        this.durationMinutesInput.set(deal.durationMinutes);
      } else {
        this.endAt.set('');
        this.durationMinutesInput.set(null);
      }
    } else {
      this.startAt.set('');
      this.endAt.set('');
      this.durationMinutesInput.set(null);
    }

    this.submitted.set(false);
    this.loading.set(false);
  }

  save = () => {
    this.submitted.set(true);
    if (this.validationError()) {
      return;
    }
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.router.navigate(['/seller/deals']);
    }, 800);
  };

  cancel = () => {
    this.router.navigate(['/seller/deals']);
  };

  // Helpers to keep duration <-> start/end in sync
  private formatToDatetimeLocal(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  private updateDurationFromDates() {
    this.durationMinutesInput.set(this.durationMinutes());
  }

  onStartAtInput = (value: string) => {
    this.startAt.set(value);
    const minutes = this.durationMinutesInput();
    if (minutes && value) {
      const end = new Date(Date.parse(value) + minutes * 60000);
      this.endAt.set(this.formatToDatetimeLocal(end));
    } else {
      this.updateDurationFromDates();
    }
  };

  onEndAtInput = (value: string) => {
    this.endAt.set(value);
    this.updateDurationFromDates();
  };

  onDurationInput = (value: string) => {
    const minutes = Number(value);
    if (!value || Number.isNaN(minutes) || minutes <= 0) {
      this.durationMinutesInput.set(null);
      return;
    }
    this.durationMinutesInput.set(minutes);
    const start = this.startAt();
    if (start) {
      const end = new Date(Date.parse(start) + minutes * 60000);
      this.endAt.set(this.formatToDatetimeLocal(end));
    }
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
    const sellerId = this.tokenService.getSellerId();
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
