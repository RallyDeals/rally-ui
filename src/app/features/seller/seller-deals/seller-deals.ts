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

export interface DealRow {
  id: string;
  name: string;
  image: string;
  status: DealStatus;
  currentParticipants: number;
  dealStock: number;
  minParticipants: number;
  durationMinutes: number;
  startTime: string;
  price: string;
  originalPrice: string;
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

export const DEALS: DealRow[] = [
  {
    id: 'GD-9402',
    name: 'Artisan Ceramic Brew Set',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSGkOu2tweFMl4s3ixgYD5Q2-gIzYt3WNvn3sJKDRFXRhCgb_XCTPoGbMspTbBu3sISO2ldSINv62qtessJlzvwOglK_cdJiNJsopUA-MFNmmOxR57AqoqHNC-pbY_Arx8sh2pvE-gjDRzTGMYM4QYvbg4LdlJkLTNP5nwBUF2NaGhwaPQG2hzAOWFjS0VVFlYPl_f0UlCl6hKd690Hq0U6BTY9oK4tfBek9EJFhte6Oxl98cNUXhcKOVz9ANdO-4HyXH9G4y5CwE',
    status: 'active',
    currentParticipants: 142,
    dealStock: 200,
    minParticipants: 40,
    durationMinutes: 2880,
    startTime: '2026-08-11T09:00:00',
    price: '34.99',
    originalPrice: '49.99',
    time: '14:22:05',
    urgent: true,
  },
  {
    id: 'GD-8812',
    name: 'Sonic Pro Wireless',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwUCxSF-_QRIwIV2buXvV9w90sb7E4VDit2cGcMWMpQ-ntIOypgE1uOgxBWky-11Kyfj2626OfQ3RLftzl032QrFxFm5NQtgK-7jcbUKgsqIJtgFCx4QZrLH9vi3cxMjvpsqtySdpAYX-IygEzvJd4xweayGHNmgA9nCPmOiEubP7L2a4l3kTeqF9xB68WdR3CRAwDv_LS_VoVtoh7ajAgJDijm-rX_Hn0lSYv8Nl3-nX2fzit42S4STLWdi8935or6VJjIfTW-e4',
    status: 'succeeded',
    currentParticipants: 500,
    dealStock: 500,
    minParticipants: 100,
    durationMinutes: 10080,
    startTime: '2026-08-04T10:00:00',
    price: '129.00',
    originalPrice: '199.00',
    time: 'Ended 2 days ago',
    urgent: false,
  },
  {
    id: 'GD-7734',
    name: 'AquaSmart Hydration',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdum2tVVRwEgwEWwqrdWvCFaQ18f32GUkCr1O69zLXM6H1eCabBS_brs81RRYd54giYLj9iHwE45mweyusCcd8zdq6aMe2waSf8ThKpgAoKBAnL2RZnzobMoq05BpD0aBXK3o9Dow9ZrhBoSpwSY_3C0t47FnxP0icnOA9kLcTO7QYux1w7Du_7xSIEGCt_olhmbsSzJ1wp1kAakor2jpdjWT21RK_jo3-Fpphtg1v0bx_y-Nnsprn2Q7nk6ANAAAk16IJDzSca-Q',
    status: 'pending',
    currentParticipants: 0,
    dealStock: 150,
    minParticipants: 60,
    durationMinutes: 1440,
    startTime: '2026-08-13T21:30:00',
    price: '22.50',
    originalPrice: '30.00',
    time: 'Starts in 3h 15m',
    urgent: false,
  },
  {
    id: 'GD-6651',
    name: 'EcoTech Tech Pouch',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDSmxS5Ux__--cPa3idO0LDpBMCzclCXsfH9YZpuq_qCY68xq2e2a5Mz05VS-9EuHJUK6_JNKPatVi-ar2aj_bN1XgCOUsIggbsuEOxjd_rsbrt-qE4IHOxZffbAyrlWLH2jt9kKuHALmtsCh437hYj6uH1Bl4dEjxG_woOwSM10AfytRrBvS-uB6d2rHOZBohrs29-S8ydsNfot9BGb6EbNl_AJ2SPaxm1K9rogyNlU_qgvuGsHu_4mVXjVxTU1z_lUAXhS2aAEg',
    status: 'failed',
    currentParticipants: 42,
    dealStock: 100,
    minParticipants: 80,
    durationMinutes: 4320,
    startTime: '2026-08-02T09:00:00',
    price: '15.00',
    originalPrice: '25.00',
    time: 'Failed 1w ago',
    urgent: false,
  },
  {
    id: 'GD-7210',
    name: 'Summit Trail Backpack',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDt0vfHKyf-KWvrp3ab2lYy2T643Sjjl6sT_KcbSeqNzT-3k62dj5SQuaD4BjptmB35Zs9uSy5rdM1T9LN6iPeVW4xZYSrQjGctukrGc3-raf7dqF7unX_UN60G-LVJ1P7llFmGmXhLpV2ZBVHmShTFvWyMPpRkPEDNRxarGN2oKKcA3BFZaEqLh63N1gjaaCqBWn27oxodcDLG5koAADfFQZI4tpWq2bqll05fmsR1Nq_X81WrOOZ1wXqM1B8HCEw7MfpR8Gbmgo4',
    status: 'active',
    currentParticipants: 78,
    dealStock: 120,
    minParticipants: 50,
    durationMinutes: 1440,
    startTime: '2026-08-12T09:30:00',
    price: '45.00',
    originalPrice: '70.00',
    time: '06:45:12',
    urgent: true,
  },
  {
    id: 'GD-6902',
    name: 'Lumen Desk Lamp',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgxNrJsmbVdEsMq9E2yT7qkWEDEhhtW1gAlQKbdD0W-FyPJK6rhVuRLNUh9IoxlximM6CpdwvZOyQ1MoQN2VGx5p-DMDTeKHbvQXUCNRZfsHK0jhwVysf-7Y-4TY3PoqcRbignibynp97Ye0XNL7SwYGZ-ZVlnDFm1WiFLebxwJASm6kEoR3G_INAwp-yITH8yMr6wQiaU_6I_HaMM7t5X2LWa2P_h2-K2XspnTlMP2x5YYN5x4Qs106T9lYaK8wbwqGZg8vDtXMA',
    status: 'cancelled',
    currentParticipants: 0,
    dealStock: 200,
    minParticipants: 80,
    durationMinutes: 2880,
    startTime: '2026-08-05T11:00:00',
    price: '18.75',
    originalPrice: '32.00',
    time: 'Cancelled 2d ago',
    urgent: false,
  },
];

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
  deals = signal<DealRow[]>(DEALS);
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
      hour: 'numeric',
      minute: '2-digit',
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
    this.deals.set(this.deals().filter((item) => item.id !== deal.id));
  };
}
