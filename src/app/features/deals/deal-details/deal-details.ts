import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { Countdown } from '../../../shared/components/countdown/countdown';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { PrimaryBtn } from '../../../shared/components/buttons/primary-btn/primary-btn';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { DealsService, DealView } from '../deals.service';
import { dealBadge } from '../deal-badge';
import { neededCount } from '../../../shared/models/deal';

const NOT_FOUND_ERROR: ApiError = {
  message: "This group deal doesn't exist or has already ended.",
  path: '/deals',
  status: 404,
  timestamp: new Date().toISOString(),
  title: 'Not found',
};

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

@Component({
  selector: 'app-deal-details',
  imports: [Breadcrumbs, Countdown, ErrorState, PrimaryBtn],
  templateUrl: './deal-details.html',
})
export class DealDetails implements OnInit, OnDestroy {
  deal = signal<DealView | null>(null);
  loading = signal(true);
  error = signal<ApiError | null>(null);
  joined = signal(false);
  copied = signal(false);
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
    const extras = (deal.images ?? []).filter((image) => image && image !== deal.image);
    return [deal.image, ...extras];
  });

  activeImage = computed(() => this.selectedImage() ?? this.deal()?.image ?? '');

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
      { label: 'Category', value: deal.category?.name ?? '—' },
      { label: 'Original Price', value: `$${deal.originalPrice.toFixed(2)}` },
      { label: 'Rally Price', value: `$${deal.dealPrice.toFixed(2)}` },
      { label: 'Status', value: deal.status },
      {
        label: 'Listed On',
        value: deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : '—',
      },
    ];
  });

  activity = computed(() => {
    const deal = this.deal();
    if (!deal) {
      return [];
    }
    const created = new Date(deal.createdAt).getTime();
    const ended = deal.endTime ? new Date(deal.endTime).getTime() : Date.now();
    const unlocked = created + (ended - created) * 0.35;
    const isLive = deal.currentParticipants >= deal.minParticipants;
    return [
      { icon: 'rocket_launch', text: 'Rally created', time: this.formatTimeAgo(created) },
      {
        icon: 'flag',
        text: `Goal set: ${deal.minParticipants} minimum participants`,
        time: this.formatTimeAgo(created),
      },
      isLive
        ? {
            icon: 'check_circle',
            text: `Minimum reached — rally is live at $${deal.dealPrice.toFixed(2)}`,
            time: this.formatTimeAgo(unlocked),
          }
        : {
            icon: 'hourglass_top',
            text: `Waiting for ${neededCount(deal)} more to unlock`,
            time: 'just now',
          },
      {
        icon: 'link',
        text: `${Math.min(Math.max(deal.currentParticipants - deal.minParticipants, 3), 12)} friends joined via invite links`,
        time: this.formatTimeAgo(ended - 60 * 60 * 1000),
      },
      {
        icon: 'person_remove',
        text: '1 participant left this rally',
        time: this.formatTimeAgo(ended - 90 * 60 * 1000),
      },
      {
        icon: 'group_add',
        text: `${deal.currentParticipants} people joined this rally so far`,
        time: 'just now',
      },
    ];
  });

  private formatTimeAgo(timestamp: number): string {
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
    { label: this.deal()?.title ?? 'Deal' },
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
    return !!deal && deal.status !== 'active';
  });

  badge = computed(() => {
    const deal = this.deal();
    return deal ? dealBadge(deal) : null;
  });

  statusText = computed(() => {
    const deal = this.deal();
    if (!deal) {
      return '';
    }
    switch (deal.status) {
      case 'active':
        return 'Rally Active.';
      case 'pending':
        return 'Pending.';
      case 'succeeded':
        return 'Rally Succeeded.';
      case 'failed':
        return 'Rally Failed.';
      case 'cancelled':
        return 'Cancelled.';
    }
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly dealsService: DealsService,
  ) {}

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
    this.joined.set(false);
    this.copied.set(false);
    this.selectedImage.set(null);
    this.selectedTab.set('description');
    this.dealsService.getActiveDeal(id).subscribe({
      next: (deal) => {
        if (deal) {
          this.deal.set(deal);
        } else {
          this.error.set(NOT_FOUND_ERROR);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(toApiError(err));
      },
    });
  }

  joinDeal = () => {
    this.joined.set(true);
    const deal = this.deal();
    if (!deal) {
      return;
    }
    this.dealsService.joinDeal(deal.id).subscribe({
      next: (updated) => {
        if (updated) {
          this.deal.set(updated);
        }
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
    const url = window.location.href;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => this.showCopied(), () => this.fallbackCopy(url));
    } else {
      this.fallbackCopy(url);
    }
  };

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

  ngOnDestroy(): void {
    clearTimeout(this.copyTimer);
  }
}
