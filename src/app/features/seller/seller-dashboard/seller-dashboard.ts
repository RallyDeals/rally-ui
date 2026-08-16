import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PLACEHOLDER_IMAGE } from '../../../shared/constants/placeholder';
import { resolveImageUrl } from '../../../shared/utils/image-url';
import { DealStatus, DealStatusLabels, DealView } from '../../../shared/models/deal';
import { MetricCard } from '../components/metric-card/metric-card';
import { DealsService } from '../../deals/deals.service';
import { TokenService } from '../../../shared/services/token.service';
import {
  dateInRange,
  todayISO,
  daysAgoISO,
} from '../../../shared/utils/date-range.util';
import { formatMoney } from '../../../shared/utils/money.util';

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
  image?: string;
  status: DealStatus;
  statusLabel: string;
  currentParticipants: number;
  dealStock: number;
  progress: number;
  revenue: string;
}

const STATUS_CLASSES: Record<DealStatus, string> = {
  ACTIVE: 'bg-surface-container-high text-on-surface-variant',
  SUCCEEDED: 'bg-secondary-container text-on-secondary-container',
  PENDING: 'bg-surface-container text-on-surface-variant',
  FAILED: 'bg-error-container text-on-error-container',
  CANCELLED: 'bg-surface-container-high text-on-surface-variant',
};

const BAR_CLASSES: Record<DealStatus, string> = {
  ACTIVE: 'bg-primary-container',
  SUCCEEDED: 'bg-secondary',
  PENDING: 'bg-outline-variant',
  FAILED: 'bg-error',
  CANCELLED: 'bg-outline-variant',
};

function toDealRow(deal: DealView): DealRow {
  const progress = deal.dealStock > 0
    ? Math.min(100, Math.round((deal.currentParticipants / deal.dealStock) * 100))
    : 0;
  return {
    name: deal.title,
    image: deal.image,
    status: deal.status,
    statusLabel: DealStatusLabels[deal.status],
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
  private readonly tokenService = inject(TokenService);

  readonly productImage = PLACEHOLDER_IMAGE;
  readonly resolveImageUrl = resolveImageUrl;
  readonly statusClasses = STATUS_CLASSES;
  readonly barClasses = BAR_CLASSES;

  private readonly allDeals = toSignal(
    this.dealsService.getSellerDeals(this.getSellerId(), { size: 100 }).pipe(
      map((page) => page.content)
    ),
    { initialValue: [] as DealView[] }
  );

  deals = computed(() => this.allDeals().map(toDealRow));

  readonly rangeDeals = computed(() =>
    this.allDeals()
      .filter((deal: DealView) => dateInRange(deal.createdAt, RANGE_START, RANGE_END))
      .map(toDealRow),
  );

  readonly rangeLabel = computed(() => RANGE_LABEL);

  readonly totalRevenueValue = computed(() => {
    const total = this.allDeals()
      .filter((deal: DealView) => dateInRange(deal.createdAt, RANGE_START, RANGE_END))
      .reduce((sum: number, deal: DealView) => sum + deal.dealPrice * deal.currentParticipants, 0);
    return `$${formatMoney(total)}`;
  });

  readonly participantsValue = computed(() =>
    this.rangeDeals().reduce((sum: number, deal: DealRow) => sum + deal.currentParticipants, 0).toLocaleString(),
  );

  readonly successRateValue = computed(() => {
    const deals = this.rangeDeals();
    if (deals.length === 0) {
      return '0%';
    }
    const succeeded = deals.filter((deal: DealRow) => deal.status === 'SUCCEEDED').length;
    return `${Math.round((succeeded / deals.length) * 100)}%`;
  });

  readonly pendingOrdersValue = computed(
    () => String(this.rangeDeals().filter((deal: DealRow) => deal.status === 'ACTIVE').length),
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
    return this.tokenService.getSellerId() ?? '';
  }
}
