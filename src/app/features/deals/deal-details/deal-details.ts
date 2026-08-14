import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { Countdown } from '../../../shared/components/countdown/countdown';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { DealsService, DealView } from '../deals.service';

const NOT_FOUND_ERROR: ApiError = {
  message: "This group deal doesn't exist or has already ended.",
  path: '/deals',
  status: 404,
  timestamp: new Date().toISOString(),
  title: 'Not found',
};

@Component({
  selector: 'app-deal-details',
  imports: [RouterLink, Breadcrumbs, Countdown, ErrorState],
  templateUrl: './deal-details.html',
})
export class DealDetails implements OnInit, OnDestroy {
  deal = signal<DealView | null>(null);
  loading = signal(true);
  error = signal<ApiError | null>(null);
  joined = signal(false);
  copied = signal(false);
  private copyTimer: ReturnType<typeof setTimeout> | undefined;

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
    return deal ? Math.max(0, deal.totalSpots - deal.joined) : 0;
  });

  progress = computed(() => {
    const deal = this.deal();
    if (!deal) {
      return 0;
    }
    return Math.min(100, Math.max(0, deal.progressPercent ?? 0));
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly dealsService: DealsService,
  ) {}

  ngOnInit(): void {
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
