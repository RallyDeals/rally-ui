import { Component, DestroyRef, NgZone, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, interval, switchMap, startWith, catchError, of } from 'rxjs';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { Countdown } from '../../../shared/components/countdown/countdown';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { PrimaryBtn } from '../../../shared/components/buttons/primary-btn/primary-btn';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { DealsService, ParticipantSummary, ParticipationStatus } from '../deals.service';
import { DealStatus } from '../../../shared/models/deal';
import { DealDetails as DealDetailsModel } from '../interfaces/deal-details';
import { ActivityEvent } from '../interfaces/activity-event';
import { dealBadge } from '../deal-badge';
import { PaymentDialog } from '../../../shared/components/payment-dialog/payment-dialog';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { AuthService } from '../../../core/auth/auth.service';
import { AvatarPipe } from '../../../shared/pipes/avatar-pipe';

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
const JOIN_POLL_INTERVAL_MS = 3_000;
const JOIN_POLL_TIMEOUT_MS = 30_000;

@Component({
  selector: 'app-deal-details',
  imports: [
    Breadcrumbs,
    Countdown,
    ErrorState,
    PrimaryBtn,
    PaymentDialog,
    CurrencyPipe,
    TitleCasePipe,
    TimeAgoPipe,
    AvatarPipe,
    RouterLink,
  ],
  templateUrl: './deal-details.html',
})
export class DealDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dealsService = inject(DealsService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly titleService = inject(Title);

  private dealPollSub: Subscription | null = null;
  private joinPollSub: Subscription | null = null;

  deal = signal<DealDetailsModel | null>(null);
  loading = signal(true);
  error = signal<ApiError | null>(null);
  joined = signal<ParticipationStatus | null>(null);
  joinPending = signal(false);
  joinError = signal<string | null>(null);
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

  participants = signal<ParticipantSummary[]>([]);
  extraParticipants = signal(0);
  isActive = computed(() => this.deal()?.status === DealStatus.PENDING || this.deal()?.status === DealStatus.ACTIVE);

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
    return deal ? Math.max(0, deal.dealStock - deal.authorizedCount) : 0;
  });

  progress = computed(() => {
    const deal = this.deal();
    if (!deal || deal.dealStock <= 0) {
      return 0;
    }
    return Math.min(100, Math.max(0, Math.round((deal.authorizedCount / deal.dealStock) * 100)));
  });

  isFull = computed(() => {
    const deal = this.deal();
    return !!deal && deal.currentParticipants >= deal.dealStock;
  });

  minReached = computed(() => {
    const deal = this.deal();
    return !!deal && deal.currentParticipants >= deal.minParticipants;
  });

  minMarkerPercent = computed(() => {
    const deal = this.deal();
    if (!deal || deal.dealStock <= 0) {
      return 0;
    }
    return Math.min(100, Math.max(0, (deal.minParticipants / deal.dealStock) * 100));
  });

  isClosed = computed(() => {
    const deal = this.deal();
    return !!deal && deal.status !== DealStatus.ACTIVE && deal.status !== DealStatus.PENDING;
  });

  isPending = computed(() => this.deal()?.status === DealStatus.PENDING);

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
      this.stopJoinStatusPoll();
      clearTimeout(this.copyTimer);
    });
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadDeal(id);
      }
    });
  }

  loadDeal(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.copied.set(false);
    this.selectedImage.set(null);
    this.selectedTab.set('description');
    this.activity.set([]);
    this.joinPending.set(false);
    this.joinError.set(null);
    this.stopJoinStatusPoll();
    this.dealsService.getDeal(id).subscribe({
      next: (deal) => {
        if (deal) {
          this.deal.set(deal);
          this.titleService.setTitle(deal.productName);
          this.startDealPoll(id);
          this.loadActivity(id);
          this.loadParticipants(id);
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

  private loadParticipants(dealId: string) {
    this.dealsService.getDealParticipants(dealId).subscribe({
      next: (page) => {
        const shown = page.participants.slice(0, 3);
        this.participants.set(shown);
        this.extraParticipants.set(Math.max(0, page.activeCount - shown.length));
      },
    });
  }

  fullName(p: ParticipantSummary): string {
    return `${p.firstName} ${p.lastName}`.trim();
  }

  private checkJoinedFromActivity(events: ActivityEvent[]) {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    const userEvent = events
      .filter((e) => e.userId === userId)
      .reduce(
        (latest: ActivityEvent | null, e) =>
          !latest || e.timestamp > latest.timestamp ? e : latest,
        null,
      );

    if (!userEvent) {
      this.joined.set(null);
      return;
    }

    switch (userEvent.type) {
      case 'JOINED':
        this.joined.set(ParticipationStatus.ACTIVE);
        break;
      case 'PENDING':
        this.joined.set(ParticipationStatus.PENDING);
        break;
      case 'DECLINED':
        this.joined.set(null);
        this.joinError.set('Your last payment attempt was declined. Please try again.');
        break;
      case 'LEFT':
      default:
        this.joined.set(ParticipationStatus.LEFT);
        break;
    }
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

  private startJoinStatusPoll(dealId: string, participationId: string) {
    this.stopJoinStatusPoll();
    const deadline = Date.now() + JOIN_POLL_TIMEOUT_MS;
    this.ngZone.runOutsideAngular(() => {
      this.joinPollSub = interval(JOIN_POLL_INTERVAL_MS)
        .pipe(
          startWith(0),
          switchMap(() =>
            this.dealsService
              .getParticipationStatus(dealId, participationId)
              .pipe(catchError(() => of(null))),
          ),
        )
        .subscribe((status: ParticipationStatus | null) => {
          if (status === 'active') {
            this.ngZone.run(() => {
              this.joinPending.set(false);
              this.joinError.set(null);
              this.joined.set(ParticipationStatus.ACTIVE);
              this.loadActivity(dealId);
              this.loadParticipants(dealId);
            });
            this.stopJoinStatusPoll();
            return;
          }

          if (status === 'declined') {
            this.ngZone.run(() => {
              this.joinPending.set(false);
              this.joined.set(null);
              this.joinError.set(
                'Your payment was declined. Please try again with a different payment method.',
              );
            });
            this.stopJoinStatusPoll();
            return;
          }

          if (status === 'left') {
            this.ngZone.run(() => {
              this.joinPending.set(false);
              this.joined.set(null);
              this.joinError.set('Your join request could not be completed. Please try again.');
            });
            this.stopJoinStatusPoll();
            return;
          }

          // status is 'pending', or the check failed transiently (null): keep polling until the deadline.
          if (Date.now() > deadline) {
            this.ngZone.run(() => {
              this.joinPending.set(false);
              this.joinError.set("We're still processing your payment — check back in a moment.");
            });
            this.stopJoinStatusPoll();
          }
        });
    });
  }

  private stopJoinStatusPoll() {
    this.joinPollSub?.unsubscribe();
    this.joinPollSub = null;
  }

  joinDeal = () => {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: `/deals/${this.route.snapshot.paramMap.get('id')}` },
      });
      return;
    }
    this.showPaymentDialog.set(true);
  };

  onPaymentConfirmed = (data: { paymentMethodId: string; address: string }) => {
    const deal = this.deal();
    if (!deal) return;
    this.showPaymentDialog.set(false);
    this.joinError.set(null);
    this.joinPending.set(true);
    this.dealsService.joinDeal(deal.id, data.paymentMethodId, data.address).subscribe({
      next: (participation) => this.startJoinStatusPoll(deal.id, participation.id),
      error: () => {
        this.joinPending.set(false);
        this.joinError.set('Failed to join the rally. Please try again.');
      },
    });
  };

  leaveDeal = () => {
    const deal = this.deal();
    if (!deal) {
      return;
    }
    this.dealsService.leaveDeal(deal.id).subscribe({
      next: () => {
        this.joined.set(ParticipationStatus.LEFT);
        this.loadActivity(deal.id);
        this.loadParticipants(deal.id);
      },
    });
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
      navigator.clipboard.writeText(url).then(
        () => this.showCopied(),
        () => this.fallbackCopy(url),
      );
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

  activityIcon(type: ActivityEvent['type']): string {
    switch (type) {
      case 'JOINED':
        return 'group_add';
      case 'PENDING':
        return 'hourglass_top';
      case 'DECLINED':
        return 'cancel';
      default:
        return 'person_remove';
    }
  }

  retry = () => {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDeal(id);
    }
  };
}
