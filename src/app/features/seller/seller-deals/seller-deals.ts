import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pagination } from '../../products/browse-products/pagination/pagination';
import { FilterPills, FilterPillOption } from '../../../shared/components/filter-pills/filter-pills';
import { SearchInput } from '../../../shared/components/search-input/search-input';
import { IconButton } from '../../../shared/components/icon-button/icon-button';
import {
  DealStatus,
  DealStatusBadge,
} from '../components/deal-status-badge/deal-status-badge';
import { DealProgress, ProgressTone } from '../components/deal-progress/deal-progress';
import { MetricCard } from '../components/metric-card/metric-card';
import {
  ConfirmDialog,
  ConfirmDialogRequest,
} from '../../../shared/components/confirm-dialog/confirm-dialog';
import { DealView } from '../../../shared/models/deal';
import { deleteDeal, listDeals } from '../../../shared/mocks/deals';

export interface DealRow {
  id: string;
  code: string;
  productId: string;
  sellerId: string;
  name: string;
  image: string;
  status: DealStatus;
  currentParticipants: number;
  authorizedCount: number;
  dealStock: number;
  minParticipants: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  dealPrice: number;
  originalPrice: number;
  timeRemainingSeconds: number | null;
  createdAt: string;
  time: string;
  urgent: boolean;
}

export const DEAL_STATUS_OPTIONS: FilterPillOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'succeeded', label: 'Succeeded' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PROGRESS_TONES: Record<DealStatus, ProgressTone> = {
  pending: 'neutral',
  active: 'primary',
  succeeded: 'secondary',
  failed: 'error',
  cancelled: 'neutral',
};

function formatCountdown(endTime: string): string {
  const end = new Date(endTime).getTime();
  if (Number.isNaN(end)) {
    return '—';
  }
  const seconds = Math.max(0, Math.floor((end - Date.now()) / 1000));
  if (seconds === 0) {
    return 'Ended';
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (h > 99) {
    return `${Math.floor(h / 24)}d ${pad(h % 24)}h`;
  }
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function timeLabel(deal: DealView): string {
  switch (deal.status) {
    case 'active':
      return deal.endTime ? formatCountdown(deal.endTime) : 'Live';
    case 'pending': {
      const start = deal.startTime ? new Date(deal.startTime).getTime() : NaN;
      if (Number.isNaN(start)) {
        return 'Starting soon';
      }
      const minutes = Math.round((start - Date.now()) / 60000);
      if (minutes <= 0) {
        return 'Starting soon';
      }
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return h > 0 ? `Starts in ${h}h ${m}m` : `Starts in ${m}m`;
    }
    case 'succeeded':
      return 'Ended';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
  }
}

function urgentLabel(deal: DealView): boolean {
  if (deal.status !== 'active' || !deal.endTime) {
    return false;
  }
  const remaining = new Date(deal.endTime).getTime() - Date.now();
  return Number.isFinite(remaining) && remaining > 0 && remaining < 6 * 3600 * 1000;
}

function toDealRow(deal: DealView): DealRow {
  return {
    id: deal.id,
    code: `GD-${deal.id.slice(-4).toUpperCase()}`,
    productId: deal.productId,
    sellerId: deal.sellerId,
    name: deal.title,
    image: deal.image,
    status: deal.status,
    currentParticipants: deal.currentParticipants,
    authorizedCount: deal.authorizedCount,
    dealStock: deal.dealStock,
    minParticipants: deal.minParticipants,
    durationMinutes: deal.durationMinutes,
    startTime: deal.startTime ?? '',
    endTime: deal.endTime ?? '',
    dealPrice: deal.dealPrice,
    originalPrice: deal.originalPrice,
    timeRemainingSeconds: deal.timeRemainingSeconds,
    createdAt: deal.createdAt,
    time: timeLabel(deal),
    urgent: urgentLabel(deal),
  };
}

const VALID_STATUSES: Array<'ALL' | DealStatus> = [
  'ALL',
  'active',
  'pending',
  'succeeded',
  'failed',
  'cancelled',
];

interface DealMenu {
  id: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-seller-deals',
  imports: [
    Pagination,
    FilterPills,
    SearchInput,
    IconButton,
    DealStatusBadge,
    DealProgress,
    MetricCard,
    ConfirmDialog,
  ],
  templateUrl: './seller-deals.html',
  styleUrl: './seller-deals.css',
})
export class SellerDeals implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly statusOptions = DEAL_STATUS_OPTIONS;
  readonly progressToneFor = (status: DealStatus): ProgressTone => PROGRESS_TONES[status];

  statusFilter = signal<'ALL' | DealStatus>('ALL');
  searchQuery = signal('');
  page = signal(1);
  limit = 5;
  deals = signal<DealRow[]>(listDeals().map(toDealRow));
  menu = signal<DealMenu | null>(null);
  deleteTarget = signal<DealRow | null>(null);

  get menuId(): string | null {
    return this.menu()?.id ?? null;
  }

  get menuX(): number {
    return this.menu()?.x ?? 0;
  }

  get menuY(): number {
    return this.menu()?.y ?? 0;
  }

  readonly menuDeal = computed<DealRow | undefined>(() =>
    this.deals().find((deal) => deal.id === this.menu()?.id),
  );

  readonly visibleDeals = computed(() => {
    const status = this.statusFilter();
    const query = this.searchQuery().trim().toLowerCase();
    return this.deals().filter(
      (deal) =>
        (status === 'ALL' || deal.status === status) &&
        (query === '' || deal.name.toLowerCase().includes(query) || deal.id.toLowerCase().includes(query)),
    );
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

  formatDateTime(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  formatDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  formatTime(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  endOf = (deal: DealRow): string => {
    const start = new Date(deal.startTime);
    if (Number.isNaN(start.getTime())) {
      return deal.startTime;
    }
    return new Date(start.getTime() + deal.durationMinutes * 60000).toISOString();
  };

  readonly deleteRequest = computed<ConfirmDialogRequest | null>(() => {
    const deal = this.deleteTarget();
    if (!deal) {
      return null;
    }
    return {
      title: `Delete "${deal.name}"?`,
      message: 'This active deal will be ended and participants notified.',
      icon: 'delete',
      confirmLabel: 'Delete',
    };
  });

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const status = params['status'] as string | undefined;
      if (status && VALID_STATUSES.includes(status as 'ALL' | DealStatus)) {
        this.statusFilter.set(status as 'ALL' | DealStatus);
        this.page.set(1);
      }
    });
  }

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.visibleDeals().length / this.limit)));

  readonly pagedDeals = computed(() => {
    const start = (this.page() - 1) * this.limit;
    return this.visibleDeals().slice(start, start + this.limit);
  });

  get fromIndex(): number {
    return this.visibleDeals().length === 0 ? 0 : (this.page() - 1) * this.limit + 1;
  }

  get toIndex(): number {
    return Math.min(this.page() * this.limit, this.visibleDeals().length);
  }

  onStatusChange = (status: string) => {
    this.statusFilter.set(status as 'ALL' | DealStatus);
    this.page.set(1);
  };

  onSearchInput = (value: string) => {
    this.searchQuery.set(value);
    this.page.set(1);
  };

  clearSearch = () => {
    this.searchQuery.set('');
    this.page.set(1);
  };

  goToPage = (page: number) => {
    this.page.set(page);
  };

  goToCreate = () => {
    this.router.navigate(['/seller/deals/new']);
  };

  openDeal = (id: string | null) => {
    if (!id) {
      return;
    }
    this.menu.set(null);
    this.router.navigate(['/seller/deals', id, 'edit']);
  };

  toggleMenu = (event: Event, id: string) => {
    if (!(event.currentTarget instanceof HTMLButtonElement)) {
      return;
    }
    if (this.menu()?.id === id) {
      this.menu.set(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const x =
      rect && isFinite(rect.right) && rect.right > 0
        ? Math.min(rect.right, vw - 200)
        : Math.max(8, vw - 208);
    const y =
      rect && isFinite(rect.bottom) && rect.bottom > 0
        ? Math.min(rect.bottom + 4, vh - 130)
        : 8;
    this.menu.set({ id, x, y });
  };

  closeMenu = () => {
    this.menu.set(null);
  };

  deleteDeal = (id: string | null) => {
    if (!id) {
      return;
    }
    this.menu.set(null);
    this.deleteTarget.set(this.deals().find((deal) => deal.id === id) ?? null);
  };

  closeDeleteDialog = () => {
    this.deleteTarget.set(null);
  };

  onDeleteConfirmed = () => {
    const deal = this.deleteTarget();
    this.deleteTarget.set(null);
    if (!deal) {
      return;
    }
    deleteDeal(deal.id);
    this.deals.set(listDeals().map(toDealRow));
  };
}
