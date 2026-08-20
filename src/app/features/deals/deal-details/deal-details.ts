import { Component, DestroyRef, NgZone, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval, switchMap, startWith } from 'rxjs';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { Countdown } from '../../../shared/components/countdown/countdown';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { PrimaryBtn } from '../../../shared/components/buttons/primary-btn/primary-btn';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { DealsService } from '../deals.service';
import { TokenService } from '../../../shared/services/token.service';
import { DealStatus } from '../../../shared/models/deal';
import { DealDetails as DealDetailsModel } from '../interfaces/DealDetails';
import { ActivityEvent } from '../interfaces/ActivityEvent';
import { dealBadge } from '../deal-badge';
import { PaymentDialog } from '../payment-dialog/payment-dialog';
import { isAuthenticated } from '../../../core/auth/auth-token';

const STATUS_LABELS: Record<DealStatus, string> = {
  [DealStatus.PENDING]: 'Gathering',
  [DealStatus.ACTIVE]: 'Live',
  [DealStatus.SUCCEEDED]: 'Succeeded',
  [DealStatus.FAILED]: 'Failed',
  [DealStatus.CANCELLED]: 'Cancelled',
};

const NOT_FOUND_ERROR: ApiError = {
  message: "This group deal doesn't exist or has already ended.",
  path: '/deals',
  status: 404,
  timestamp: new Date().toISOString(),
  title: 'Not found',
};

// Deals carry no createdAt; the window a deal opened in is derived from when it ends minus how long it ran.
function dealStartTime(deal: DealDetailsModel): number {
  return deal.endTime.getTime() - deal.durationMinutes * 60000;
}

type DealTab = 'description' | 'specifications' | 'activity' | 'faq';

const AVATAR_INITIALS = ['SM', 'JK', 'AL', 'RZ', 'PD', 'MT', 'NO', 'KW'];
const AVATAR_COLORS = ['#f97316', '#006c49', '#be0037', '#9d4300', '#7c4dff', '#00796b'];

const FAQS = [
  {
    q: 'How does a group deal work?',
    a: 'Everyone joins the rally at the current price. Once the minimum participants are reached the deal is confirmed and everyone pays the discounted price.',
  },
  {
    q: 'When does the rally unlock?',
    a: 'The rally unlocks as soon as the minimum participant count is reached, or when the timer expires — whichever comes first.',
  },
  {
    q: 'What happens if the goal is not reached?',
    a: 'If the minimum is not met, the deal does not go live and no one is charged. You can share the invite link to help it unlock faster.',
  },
];

const DEAL_POLL_INTERVAL_MS = 15_000;

@Component({
  selector: 'app-deal-details',
  imports: [Breadcrumbs, Countdown, ErrorState, PrimaryBtn, PaymentDialog],
  templateUrl: './deal-details.html',
})
export class DealDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dealsService = inject(DealsService);
  private readonly tokenService = inject(TokenService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  private dealPollSub: Subscription | null = null;
  private currentDealId: string | null = null;

  deal = signal<DealDetailsModel | null>(null);
  loading = signal(true);
  error = signal<ApiError | null>(null);
  joined = signal(false);
  copied = signal(false);
  showPaymentDialog = signal(false);
  selectedTab = signal<DealTab>('description');
  selectedImage = signal<string | null>(null);
  private copyTimer: ReturnType<typeof setTimeout> | undefined;

  faqs = FAQS;
  tabs: DealTab[] = ['description', 'specifications', 'activity', 'faq'];

  galleryImages = computed<string[]>(() => {
    const deal = this.deal();
    if (!deal) {
      return [];
    }
    const extras = (deal.productImages ?? []).filter(
      (image) => image && image !== deal.productImageUrl,
    );
    return [deal.productImageUrl, ...extras];
  });

  activeImage = computed(() => this.selectedImage() ?? this.deal()?.productImageUrl ?? '');

  participants = computed(() => {
    const deal = this.deal();
    if (!deal) {
      return [];
    }
    return AVATAR_INITIALS.slice(0, Math.min(3, deal.currentParticipants)).map((initials, index) => ({
      initials,
      color: AVATAR_COLORS[index % AVATAR_COLORS.length],
    }));
  });

  extraParticipants = computed(() => {
    const deal = this.deal();
    return deal ? Math.max(0, deal.currentParticipants - 3) : 0;
  });

  specs = computed(() => {
    const deal = this.deal();
    if (!deal) {
      return [];
    }
    return [
      { label: 'Category', value: deal.category },
      { label: 'Original Price', value: `$${deal.originalPrice.toFixed(2)}` },
      { label: 'Rally Price', value: `$${deal.dealPrice.toFixed(2)}` },
      { label: 'Status', value: STATUS_LABELS[deal.status] },
      { label: 'Listed On', value: new Date(dealStartTime(deal)).toLocaleDateString() },
    ];
  });

  activity = signal<ActivityEvent[]>([]);

  formatTimeAgo(timestamp: number): string {
    const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
    if (minutes < 1) {
      return 'just now';
    }
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    const hours = Math.round(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }
    return `${Math.round(hours / 24)}d ago`;
  }

  formatTimestampAgo(timestamp: string): string {
    return this.formatTimeAgo(new Date(timestamp).getTime());
  }

  milestones = computed(() => {
    const deal = this.deal();
    if (!deal) {
      return [];
    }
    return [
      {
        label: `Minimum: ${deal.minParticipants} joined`,
        detail:
          deal.currentParticipants >= deal.minParticipants
            ? 'Minimum reached — rally will succeed'
            : 'Below minimum — rally may fail at end',
        reached: deal.currentParticipants >= deal.minParticipants,
      },
      {
        label: `Current: ${deal.currentParticipants} joined`,
        detail: `Price Drop: $${deal.dealPrice.toFixed(2)}`,
        reached: true,
      },
      {
        label: `Goal: ${deal.dealStock} joined`,
        detail: 'Rally is full',
        reached: deal.currentParticipants >= deal.dealStock,
      },
    ];
  });

  breadcrumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Home', link: '/home' },
    { label: 'Deals', link: '/deals' },
    { label: this.deal()?.productName ?? 'Deal' },
  ]);

  savingsPercent = computed(() => {
    const deal = this.deal();
    if (!deal || !deal.originalPrice || deal.originalPrice <= 0) {
      return 0;
    }
    return Math.round((1 - deal.dealPrice / deal.originalPrice) * 100);
  });

  spotsLeft = computed(() => {
    const deal = this.deal();
    return deal ? Math.max(0, deal.dealStock - deal.currentParticipants) : 0;
  });

  progress = computed(() => {
    const deal = this.deal();
    if (!deal || deal.dealStock <= 0) {
      return 0;
    }
    return Math.min(100, Math.max(0, Math.round((deal.currentParticipants / deal.dealStock) * 100)));
  });

  isFull = computed(() => {
    const deal = this.deal();
    return !!deal && deal.currentParticipants >= deal.dealStock;
  });

  isClosed = computed(() => {
    const deal = this.deal();
    return !!deal && deal.status !== DealStatus.ACTIVE && deal.status !== DealStatus.PENDING;
  });

  badge = computed(() => {
    const deal = this.deal();
    return deal ? dealBadge(deal) : null;
  });

  statusText = computed(() => {
    const deal = this.deal();
    return deal ? STATUS_LABELS[deal.status] : '';
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.stopDealPoll();
      clearTimeout(this.copyTimer);
    });
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.currentDealId = id;
        this.loadDeal(id);
      }
    });
  }

  loadDeal(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.joined.set(false);
    this.copied.set(false);
    this.selectedImage.set(null);
    this.selectedTab.set('description');
    this.activity.set([]);
    this.dealsService.getDeal(id).subscribe({
      next: (deal) => {
        if (deal) {
          this.deal.set(deal);
          this.startDealPoll(id);
          this.loadActivity(id);
        } else {
          this.error.set(NOT_FOUND_ERROR);
          this.stopDealPoll();
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(toApiError(err));
        this.stopDealPoll();
      },
    });
  }

  private loadActivity(dealId: string) {
    this.dealsService.getDealActivity(dealId).subscribe({
      next: (events) => {
        this.activity.set(events);
        this.checkJoinedFromActivity(events);
      },
    });
  }

  private checkJoinedFromActivity(events: ActivityEvent[]) {
    const userId = this.tokenService.getUserId();
    if (!userId) return;
    const sorted = [...events].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    let joined = false;
    for (const event of sorted) {
      if (event.userId === userId) {
        if (event.type === 'JOINED') joined = true;
        if (event.type === 'LEFT') joined = false;
      }
    }
    this.joined.set(joined);
  }

  private startDealPoll(dealId: string) {
    this.stopDealPoll();
    this.ngZone.runOutsideAngular(() => {
      this.dealPollSub = interval(DEAL_POLL_INTERVAL_MS)
        .pipe(
          startWith(0),
          switchMap(() => this.dealsService.getDeal(dealId)),
        )
        .subscribe((deal) => {
          if (deal) {
            this.ngZone.run(() => this.deal.set(deal));
          }
        });
    });
  }

  private stopDealPoll() {
    this.dealPollSub?.unsubscribe();
    this.dealPollSub = null;
  }

  joinDeal = () => {
    // TODO: uncomment when auth service is wired
    // if (!isAuthenticated()) {
    //   this.router.navigate(['/auth/login'], {
    //     queryParams: { returnUrl: `/deals/${this.route.snapshot.paramMap.get('id')}` },
    //   });
    //   return;
    // }
    this.showPaymentDialog.set(true);
  };

  onPaymentConfirmed = (data: { paymentMethodId: string; address: string }) => {
    const deal = this.deal();
    if (!deal) return;
    this.showPaymentDialog.set(false);
    this.joined.set(true);
    this.dealsService.joinDeal(deal.id, data.paymentMethodId, data.address).subscribe({
      next: () => {
        this.loadDeal(deal.id);
      },
      error: () => {
        this.joined.set(false);
      },
    });
  };

  onPaymentCancelled = () => {
    this.showPaymentDialog.set(false);
  };

  leaveDeal = () => {
    const deal = this.deal();
    if (!deal) {
      return;
    }
    this.dealsService.leaveDeal(deal.id).subscribe({
      next: () => {
        this.joined.set(false);
        this.loadDeal(deal.id);
      },
    });
  };

  selectImage = (image: string) => {
    this.selectedImage.set(image);
  };

  selectTab = (tab: DealTab) => {
    this.selectedTab.set(tab);
  };

  inviteFriends = () => {
    const deal = this.deal();
    if (!deal) return;
    this.dealsService.createInviteLink(deal.id).subscribe({
      next: (link) => {
        const inviteUrl = `${window.location.origin}/deals/${deal.id}?invite=${link.code}`;
        this.copyToClipboard(inviteUrl);
      },
      error: () => {
        this.copyToClipboard(window.location.href);
      },
    });
  };

  private copyToClipboard(url: string): void {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => this.showCopied(), () => this.fallbackCopy(url));
    } else {
      this.fallbackCopy(url);
    }
  }

  private showCopied() {
    this.copied.set(true);
    clearTimeout(this.copyTimer);
    this.copyTimer = setTimeout(() => this.copied.set(false), 2000);
  }

  private fallbackCopy(url: string) {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textarea);
    }
    this.showCopied();
  }

  retry = () => {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDeal(id);
    }
  };
}
