import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { IconButton } from '../../../shared/components/icon-button/icon-button';
import { DealStatus, DealStatusBadge } from '../components/deal-status-badge/deal-status-badge';
import { DealProgress, ProgressTone } from '../components/deal-progress/deal-progress';
import { createDeal, getDealById, updateDeal, SELLER_ID } from '../../../shared/mocks/deals';
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

  readonly isEdit = computed(() => this.dealId() !== null);

  // Only an editable deal (new, or still pending with no participants joined) can be modified.
  readonly isFormDisabled = computed(
    () => this.isEdit() && (this.status() !== 'pending' || this.currentParticipants() > 0),
  );

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

  /** Explains why the form is locked, based on the deal's status. */
  readonly lockMessage = computed<string | null>(() => {
    if (!this.isFormDisabled()) {
      return null;
    }
    if (this.currentParticipants() > 0) {
      return 'This deal already has participants joined, so it cannot be edited.';
    }
    switch (this.status()) {
      case 'active':
        return 'This deal is live — buyers can join right now. It cannot be edited while active.';
      case 'succeeded':
        return 'This deal has ended — all deal stock was sold. It can no longer be edited.';
      case 'failed':
        return 'This deal ended without reaching the minimum participants. It can no longer be edited.';
      case 'cancelled':
        return 'This deal was cancelled and can no longer be edited.';
      default:
        return 'This deal is locked and cannot be edited.';
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
      } else {
        this.resetForm();
        this.initDefaults();
      }
    });
  }

  /** Pre-fill the schedule for a new deal: starts next hour, runs for 24h. */
  private initDefaults() {
    const durationMinutes = 1440;
    const start = new Date();
    start.setHours(start.getHours() + 1, 0, 0, 0);
    this.startAt.set(this.formatToDatetimeLocal(start));
    this.endAt.set(this.formatToDatetimeLocal(new Date(start.getTime() + durationMinutes * 60000)));
  }

  /** Clears every form field so a new deal never shows a previously loaded deal's data. */
  private resetForm() {
    this.productId.set(null);
    this.productName.set('');
    this.sku.set('');
    this.image.set('');
    this.status.set('pending');
    this.dealPrice.set('');
    this.originalPrice.set('');
    this.dealStock.set('');
    this.minParticipants.set('');
    this.currentParticipants.set(0);
    this.startAt.set('');
    this.endAt.set('');
    this.error.set(null);
    this.submitted.set(false);
  }

  loadDeal(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.resetForm();
    const deal = getDealById(id);
    if (!deal) {
      this.error.set('Deal not found. It may have been removed.');
      this.loading.set(false);
      return;
    }
    this.productId.set(deal.productId);
    this.productName.set(deal.title);
    this.image.set(deal.image);
    this.status.set(deal.status);
    this.dealPrice.set(String(deal.dealPrice));
    this.originalPrice.set(String(deal.originalPrice));
    this.dealStock.set(String(deal.dealStock));
    this.minParticipants.set(String(deal.minParticipants));
    this.currentParticipants.set(deal.currentParticipants);

    // Populate the schedule from the contract fields (startTime, endTime, durationMinutes).
    const startDate = deal.startTime ? new Date(deal.startTime) : null;
    const startOk = !!startDate && !Number.isNaN(startDate.getTime());
    const endDate = deal.endTime ? new Date(deal.endTime) : null;
    const endOk = !!endDate && !Number.isNaN(endDate.getTime());

    this.startAt.set(startOk ? this.formatToDatetimeLocal(startDate!) : '');

    if (endOk) {
      this.endAt.set(this.formatToDatetimeLocal(endDate!));
    } else if (startOk && deal.durationMinutes > 0) {
      this.endAt.set(
        this.formatToDatetimeLocal(new Date(startDate!.getTime() + deal.durationMinutes * 60000)),
      );
    } else {
      this.endAt.set('');
    }

    this.loading.set(false);
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
      productId: this.productId(),
      dealPrice: Number(this.dealPrice()),
      dealStock: Number(this.dealStock()),
      minParticipants: Number(this.minParticipants()),
      durationMinutes: this.durationMinutes() ?? 0,
    };
    this.saving.set(true);
    setTimeout(() => {
      const dealId = this.dealId();
      const startAt = this.startAt();
      const endAt = this.endAt();
      if (dealId) {
        updateDeal(dealId, {
          dealPrice: payload.dealPrice,
          dealStock: payload.dealStock,
          minParticipants: payload.minParticipants,
          durationMinutes: payload.durationMinutes,
          startTime: startAt ? new Date(startAt).toISOString() : null,
          endTime: endAt ? new Date(endAt).toISOString() : null,
          timeRemainingSeconds: payload.durationMinutes > 0 ? payload.durationMinutes * 60 : null,
        });
      } else {
        createDeal({
          sellerId: this.tokenService.getSellerId() ?? SELLER_ID,
          productId: payload.productId ?? '',
          productName: this.productName(),
          image: this.image(),
          originalPrice: Number(this.originalPrice()) || 0,
          dealPrice: payload.dealPrice,
          dealStock: payload.dealStock,
          minParticipants: payload.minParticipants,
          durationMinutes: payload.durationMinutes,
          startAt,
        });
      }
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

  onStartAtInput = (value: string) => {
    const minutes = this.durationMinutes();
    this.startAt.set(value);
    if (minutes && value) {
      const end = new Date(Date.parse(value) + minutes * 60000);
      this.endAt.set(this.formatToDatetimeLocal(end));
    }
  };

  onEndAtInput = (value: string) => {
    this.endAt.set(value);
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
