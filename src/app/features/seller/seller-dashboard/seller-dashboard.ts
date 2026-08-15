import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { PLACEHOLDER_IMAGE } from '../../../shared/constants/placeholder';
import { resolveImageUrl } from '../../../shared/utils/image-url';
import { DealStatus } from '../../../shared/models/deal';
import { MetricCard } from '../components/metric-card/metric-card';
import { listDeals } from '../../../shared/mocks/deals';
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

const STATUS_LABELS: Record<DealStatus, string> = {
  active: 'Active',
  succeeded: 'Succeeded',
  pending: 'Pending',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

const STATUS_CLASSES: Record<DealStatus, string> = {
  active: 'bg-surface-container-high text-on-surface-variant',
  succeeded: 'bg-secondary-container text-on-secondary-container',
  pending: 'bg-surface-container text-on-surface-variant',
  failed: 'bg-error-container text-on-error-container',
  cancelled: 'bg-surface-container-high text-on-surface-variant',
};

const BAR_CLASSES: Record<DealStatus, string> = {
  active: 'bg-primary-container',
  succeeded: 'bg-secondary',
  pending: 'bg-outline-variant',
  failed: 'bg-error',
  cancelled: 'bg-outline-variant',
};

function toDealRow(deal: import('../../../shared/models/deal').DealView): DealRow {
  const progress = deal.dealStock > 0
    ? Math.min(100, Math.round((deal.currentParticipants / deal.dealStock) * 100))
    : 0;
  return {
    name: deal.title,
    image: deal.image,
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
export class SellerDashboard {
  private readonly router = inject(Router);

  readonly productImage = PLACEHOLDER_IMAGE;
  readonly resolveImageUrl = resolveImageUrl;
  readonly statusClasses = STATUS_CLASSES;
  readonly barClasses = BAR_CLASSES;

  deals = signal<DealRow[]>(listDeals().map(toDealRow));

  readonly rangeDeals = computed(() =>
    listDeals()
      .filter((deal) => dateInRange(deal.createdAt, RANGE_START, RANGE_END))
      .map(toDealRow),
  );

  readonly rangeLabel = computed(() => RANGE_LABEL);

  readonly totalRevenueValue = computed(() => {
    const total = listDeals()
      .filter((deal) => dateInRange(deal.createdAt, RANGE_START, RANGE_END))
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
    const succeeded = deals.filter((deal) => deal.status === 'succeeded').length;
    return `${Math.round((succeeded / deals.length) * 100)}%`;
  });

  readonly pendingOrdersValue = computed(
    () => String(this.rangeDeals().filter((deal) => deal.status === 'active').length),
  );

  goToCreateDeal = () => {
    this.router.navigate(['/seller/deals/new']);
  };

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
}
