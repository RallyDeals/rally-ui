import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { DealStatusBadge } from '../components/deal-status-badge/deal-status-badge';
import { DealProgress } from '../components/deal-progress/deal-progress';
import { PROGRESS_TONES } from '../seller-deals/seller-deals.model';
import { DealsService, ParticipantSummary } from '../../deals/deals.service';
import { DealDetails } from '../../deals/interfaces/deal-details';
import { DealStatus } from '../../../shared/models/deal';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { resolveImageUrl } from '../../../shared/utils/image-url';
import { dealCode } from '../../../shared/utils/order-code.util';
import { AvatarPipe } from '../../../shared/pipes/avatar-pipe';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

const NOT_FOUND_ERROR: ApiError = {
  message: 'This deal no longer exists.',
  path: '/seller/deals',
  status: 404,
  timestamp: new Date().toISOString(),
  title: 'Not found',
};

@Component({
  selector: 'app-seller-deal-detail',
  imports: [
    Breadcrumbs,
    ErrorState,
    DealStatusBadge,
    DealProgress,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    AvatarPipe,
    TimeAgoPipe,
  ],
  templateUrl: './seller-deal-detail.html',
})
export class SellerDealDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly dealsService = inject(DealsService);
  private readonly titleService = inject(Title);

  private readonly dealId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly deal = signal<DealDetails | null>(null);
  readonly participants = signal<ParticipantSummary[]>([]);
  readonly activeParticipantCount = signal(0);
  readonly loading = signal(true);
  readonly error = signal<ApiError | null>(null);

  readonly DealStatus = DealStatus;
  readonly resolveImageUrl = resolveImageUrl;
  readonly code = dealCode(this.dealId);

  readonly progressTone = computed(() => {
    const deal = this.deal();
    return deal ? PROGRESS_TONES[deal.status] : 'neutral';
  });

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Deals', link: '/seller/deals' },
    { label: this.deal()?.productName ?? this.code },
  ]);

  constructor() {
    this.loadDeal();
  }

  loadDeal = () => {
    this.loading.set(true);
    this.error.set(null);
    this.dealsService.getDeal(this.dealId).subscribe({
      next: (deal) => {
        this.loading.set(false);
        if (!deal) {
          this.error.set(NOT_FOUND_ERROR);
          return;
        }
        this.deal.set(deal);
        this.titleService.setTitle(deal.productName);
        this.loadParticipants();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(toApiError(err));
      },
    });
  };

  private loadParticipants() {
    this.dealsService.getDealParticipants(this.dealId).subscribe({
      next: (page) => {
        this.participants.set(page.participants);
        this.activeParticipantCount.set(page.activeCount);
      },
    });
  }

  fullName(p: ParticipantSummary): string {
    return `${p.firstName} ${p.lastName}`.trim();
  }
}
