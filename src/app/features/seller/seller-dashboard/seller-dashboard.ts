import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PLACEHOLDER_IMAGE } from '../../../shared/constants/placeholder';
import { resolveImageUrl } from '../../../shared/utils/image-url';
import { DealStatus } from '../../../shared/models/deal';
import { DealOverview } from '../../deals/interfaces/DealOverview';
import { MetricCard } from '../components/metric-card/metric-card';
import { DealsService } from '../../deals/deals.service';
import { TokenService } from '../../../shared/services/token.service';
import {
  dateInRange,
  todayISO,
  daysAgoISO,
} from '../../../shared/utils/date-range.util';
import { formatMoney } from '../../../shared/utils/money.util';
import { AuthService } from '../../../core/auth/auth.service';

const RANGE_START = daysAgoISO(30);
const RANGE_END = todayISO();
const RANGE_LABEL = 'Last 30 Days';

interface ActivityItem {
  icon: string;
  title: string;
  text: string;
  time: string;
  tone: string;
  filled: boolean;
}

interface DealRow {
  name: string;
  image: string;
  status: DealStatus;
  statusLabel: string;
  currentParticipants: number;
  dealStock: number;
  progress: number;
  revenue: string;
}

const STATUS_LABELS: Record<DealStatus, string> = {
  [DealStatus.PENDING]: 'Pending',
  [DealStatus.ACTIVE]: 'Active',
  [DealStatus.SUCCEEDED]: 'Succeeded',
  [DealStatus.FAILED]: 'Failed',
  [DealStatus.CANCELLED]: 'Cancelled',
};

const STATUS_CLASSES: Record<DealStatus, string> = {
  [DealStatus.ACTIVE]: 'bg-surface-container-high text-on-surface-variant',
  [DealStatus.SUCCEEDED]: 'bg-secondary-container text-on-secondary-container',
  [DealStatus.PENDING]: 'bg-surface-container text-on-surface-variant',
  [DealStatus.FAILED]: 'bg-error-container text-on-error-container',
  [DealStatus.CANCELLED]: 'bg-surface-container-high text-on-surface-variant',
};

const BAR_CLASSES: Record<DealStatus, string> = {
  [DealStatus.ACTIVE]: 'bg-primary-container',
  [DealStatus.SUCCEEDED]: 'bg-secondary',
  [DealStatus.PENDING]: 'bg-outline-variant',
  [DealStatus.FAILED]: 'bg-error',
  [DealStatus.CANCELLED]: 'bg-outline-variant',
};

/** Deals carry no createdAt; the window a deal opened in is derived from when it ends minus how long it ran. */
function dealStartIso(deal: DealOverview): string {
  return new Date(deal.endTime.getTime() - deal.durationMinutes * 60000).toISOString();
}

function toDealRow(deal: DealOverview): DealRow {
  const progress = deal.dealStock > 0
    ? Math.min(100, Math.round((deal.currentParticipants / deal.dealStock) * 100))
    : 0;
  return {
    name: deal.productName,
    image: deal.productImageUrl,
    status: deal.status,
    statusLabel: STATUS_LABELS[deal.status],
    currentParticipants: deal.currentParticipants,
    dealStock: deal.dealStock,
    progress,
    revenue: `$${formatMoney(deal.dealPrice * deal.currentParticipants)}`,
  };
}

@Component({
  selector: 'app-seller-dashboard',
  imports: [NgClass, MetricCard],
  templateUrl: './seller-dashboard.html',
  styleUrl: './seller-dashboard.css',
})
export class SellerDashboard implements OnInit {
  private readonly router = inject(Router);
  private readonly dealsService = inject(DealsService);
  private readonly authService = inject(AuthService);

  readonly productImage = PLACEHOLDER_IMAGE;
  readonly resolveImageUrl = resolveImageUrl;
  readonly statusClasses = STATUS_CLASSES;
  readonly barClasses = BAR_CLASSES;

  readonly loading = signal(true);

  private readonly allDeals = toSignal(
    this.dealsService.getSellerDeals(this.getSellerId(), { limit: 100 }).pipe(
      map((page) => {
        this.loading.set(false);
        return page.items;
      })
    ),
    { initialValue: [] as DealOverview[] }
  );

  deals = computed(() => this.allDeals().map(toDealRow));

  readonly rangeDeals = computed(() =>
    this.allDeals()
      .filter((deal) => dateInRange(dealStartIso(deal), RANGE_START, RANGE_END))
      .map(toDealRow),
  );

  readonly rangeLabel = computed(() => RANGE_LABEL);

  readonly totalRevenueValue = computed(() => {
    const total = this.allDeals()
      .filter((deal) => dateInRange(dealStartIso(deal), RANGE_START, RANGE_END))
      .reduce((sum, deal) => sum + deal.dealPrice * deal.currentParticipants, 0);
    return `$${formatMoney(total)}`;
  });

  readonly participantsValue = computed(() =>
    this.rangeDeals().reduce((sum, deal) => sum + deal.currentParticipants, 0).toLocaleString(),
  );

  readonly successRateValue = computed(() => {
    const deals = this.rangeDeals();
    if (deals.length === 0) {
      return '0%';
    }
    const succeeded = deals.filter((deal) => deal.status === DealStatus.SUCCEEDED).length;
    return `${Math.round((succeeded / deals.length) * 100)}%`;
  });

  readonly pendingOrdersValue = computed(
    () => String(this.rangeDeals().filter((deal) => deal.status === DealStatus.ACTIVE).length),
  );

  goToCreateDeal = () => {
    this.router.navigate(['/seller/deals/new']);
  };

  getStatusClass(status: DealStatus): string {
    return this.statusClasses[status];
  }

  getBarClass(status: DealStatus): string {
    return this.barClasses[status];
  }

  readonly toneClasses: Record<string, string> = {
    primary: 'bg-surface-container-high text-primary',
    secondary: 'bg-secondary-container text-secondary',
    tertiary: 'bg-tertiary-container text-tertiary',
    'primary-fixed': 'bg-primary-fixed text-primary',
  };

  readonly activity: ActivityItem[] = [
    {
      icon: 'shopping_bag',
      tone: 'primary',
      filled: false,
      title: 'New order placed',
      text: 'User \'SarahM\' joined deal "Wireless Earbuds PRO".',
      time: '10 mins ago',
    },
    {
      icon: 'check_circle',
      tone: 'secondary',
      filled: true,
      title: 'Deal Completed!',
      text: '"Smart Home Hub" reached 100% capacity.',
      time: '45 mins ago',
    },
    {
      icon: 'campaign',
      tone: 'primary-fixed',
      filled: false,
      title: 'Deal Published',
      text: '"Ergonomic Office Chair" is now live.',
      time: '2 hours ago',
    },
  ];

  ngOnInit() {}

  private getSellerId(): string {
    return this.authService.currentUser()?.id ?? '';
  }
}
