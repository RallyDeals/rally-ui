import { Component, computed, signal } from '@angular/core';
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

interface DealRow {
  id: string;
  name: string;
  image: string;
  status: DealStatus;
  joined: number;
  required: number;
  price: string;
  originalPrice: string;
  time: string;
  urgent: boolean;
}

const STATUS_OPTIONS: FilterPillOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'expired', label: 'Expired' },
];

const PROGRESS_TONES: Record<DealStatus, ProgressTone> = {
  active: 'primary',
  completed: 'secondary',
  scheduled: 'neutral',
  expired: 'error',
};

const DEALS: DealRow[] = [
  {
    id: 'GD-9402',
    name: 'Artisan Ceramic Brew Set',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSGkOu2tweFMl4s3ixgYD5Q2-gIzYt3WNvn3sJKDRFXRhCgb_XCTPoGbMspTbBu3sISO2ldSINv62qtessJlzvwOglK_cdJiNJsopUA-MFNmmOxR57AqoqHNC-pbY_Arx8sh2pvE-gjDRzTGMYM4QYvbg4LdlJkLTNP5nwBUF2NaGhwaPQG2hzAOWFjS0VVFlYPl_f0UlCl6hKd690Hq0U6BTY9oK4tfBek9EJFhte6Oxl98cNUXhcKOVz9ANdO-4HyXH9G4y5CwE',
    status: 'active',
    joined: 142,
    required: 200,
    price: '34.99',
    originalPrice: '49.99',
    time: '14:22:05',
    urgent: true,
  },
  {
    id: 'GD-8812',
    name: 'Sonic Pro Wireless',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwUCxSF-_QRIwIV2buXvV9w90sb7E4VDit2cGcMWMpQ-ntIOypgE1uOgxBWky-11Kyfj2626OfQ3RLftzl032QrFxFm5NQtgK-7jcbUKgsqIJtgFCx4QZrLH9vi3cxMjvpsqtySdpAYX-IygEzvJd4xweayGHNmgA9nCPmOiEubP7L2a4l3kTeqF9xB68WdR3CRAwDv_LS_VoVtoh7ajAgJDijm-rX_Hn0lSYv8Nl3-nX2fzit42S4STLWdi8935or6VJjIfTW-e4',
    status: 'completed',
    joined: 500,
    required: 500,
    price: '129.00',
    originalPrice: '199.00',
    time: 'Ended 2 days ago',
    urgent: false,
  },
  {
    id: 'GD-7734',
    name: 'AquaSmart Hydration',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdum2tVVRwEgwEWwqrdWvCFaQ18f32GUkCr1O69zLXM6H1eCabBS_brs81RRYd54giYLj9iHwE45mweyusCcd8zdq6aMe2waSf8ThKpgAoKBAnL2RZnzobMoq05BpD0aBXK3o9Dow9ZrhBoSpwSY_3C0t47FnxP0icnOA9kLcTO7QYux1w7Du_7xSIEGCt_olhmbsSzJ1wp1kAakor2jpdjWT21RK_jo3-Fpphtg1v0bx_y-Nnsprn2Q7nk6ANAAAk16IJDzSca-Q',
    status: 'scheduled',
    joined: 0,
    required: 150,
    price: '22.50',
    originalPrice: '30.00',
    time: 'Starts in 3h 15m',
    urgent: false,
  },
  {
    id: 'GD-6651',
    name: 'EcoTech Tech Pouch',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDSmxS5Ux__--cPa3idO0LDpBMCzclCXsfH9YZpuq_qCY68xq2e2a5Mz05VS-9EuHJUK6_JNKPatVi-ar2aj_bN1XgCOUsIggbsuEOxjd_rsbrt-qE4IHOxZffbAyrlWLH2jt9kKuHALmtsCh437hYj6uH1Bl4dEjxG_woOwSM10AfytRrBvS-uB6d2rHOZBohrs29-S8ydsNfot9BGb6EbNl_AJ2SPaxm1K9rogyNlU_qgvuGsHu_4mVXjVxTU1z_lUAXhS2aAEg',
    status: 'expired',
    joined: 42,
    required: 100,
    price: '15.00',
    originalPrice: '25.00',
    time: 'Expired 1w ago',
    urgent: false,
  },
  {
    id: 'GD-7210',
    name: 'Summit Trail Backpack',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDt0vfHKyf-KWvrp3ab2lYy2T643Sjjl6sT_KcbSeqNzT-3k62dj5SQuaD4BjptmB35Zs9uSy5rdM1T9LN6iPeVW4xZYSrQjGctukrGc3-raf7dqF7unX_UN60G-LVJ1P7llFmGmXhLpV2ZBVHmShTFvWyMPpRkPEDNRxarGN2oKKcA3BFZaEqLh63N1gjaaCqBWn27oxodcDLG5koAADfFQZI4tpWq2bqll05fmsR1Nq_X81WrOOZ1wXqM1B8HCEw7MfpR8Gbmgo4',
    status: 'active',
    joined: 78,
    required: 120,
    price: '45.00',
    originalPrice: '70.00',
    time: '06:45:12',
    urgent: true,
  },
  {
    id: 'GD-6902',
    name: 'Lumen Desk Lamp',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgxNrJsmbVdEsMq9E2yT7qkWEDEhhtW1gAlQKbdD0W-FyPJK6rhVuRLNUh9IoxlximM6CpdwvZOyQ1MoQN2VGx5p-DMDTeKHbvQXUCNRZfsHK0jhwVysf-7Y-4TY3PoqcRbignibynp97Ye0XNL7SwYGZ-ZVlnDFm1WiFLebxwJASm6kEoR3G_INAwp-yITH8yMr6wQiaU_6I_HaMM7t5X2LWa2P_h2-K2XspnTlMP2x5YYN5x4Qs106T9lYaK8wbwqGZg8vDtXMA',
    status: 'scheduled',
    joined: 0,
    required: 200,
    price: '18.75',
    originalPrice: '32.00',
    time: 'Starts in 1d 4h',
    urgent: false,
  },
];

@Component({
  selector: 'app-seller-deals',
  imports: [Pagination, FilterPills, SearchInput, IconButton, DealStatusBadge, DealProgress, MetricCard],
  templateUrl: './seller-deals.html',
  styleUrl: './seller-deals.css',
})
export class SellerDeals {
  readonly statusOptions = STATUS_OPTIONS;
  readonly progressToneFor = (status: DealStatus): ProgressTone => PROGRESS_TONES[status];

  statusFilter = signal<'ALL' | DealStatus>('ALL');
  searchQuery = signal('');
  page = signal(1);
  limit = 5;

  readonly visibleDeals = computed(() => {
    const status = this.statusFilter();
    const query = this.searchQuery().trim().toLowerCase();
    return DEALS.filter(
      (deal) =>
        (status === 'ALL' || deal.status === status) &&
        (query === '' || deal.name.toLowerCase().includes(query) || deal.id.toLowerCase().includes(query)),
    );
  });

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
}
