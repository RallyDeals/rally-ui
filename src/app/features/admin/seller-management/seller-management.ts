import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { SellerStats } from './seller-stats/seller-stats';
import { SellerToolbar } from './seller-toolbar/seller-toolbar';
import { SellerRow } from './seller-row/seller-row';
import { Seller } from '../interfaces/seller';
import { UserService } from '../../auth/admin-user.service';
import { ProductsService } from '../../products/products.service';
import { DealsService } from '../../deals/deals.service';

const PAGE_SIZE = 3;

@Component({
  selector: 'app-seller-management',
  imports: [PageHeader, SellerStats, SellerToolbar, SellerRow, Pagination, ErrorState],
  templateUrl: './seller-management.html',
})
export class SellerManagement implements OnInit {
  userService = inject(UserService);
  productsService = inject(ProductsService);
  dealService = inject(DealsService);
  pendingApprovalProductsCount = signal<number>(0);
  activeDealsCount = signal<number>(0);
  totalSellersCount = signal<number>(0);
  total = signal<number>(0);
  sellers = signal<Seller[]>([]);
  loading = signal(true);
  loadError = signal<ApiError | null>(null);
  search = signal('');
  page = signal<number>(1);

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));

  rangeStart = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * PAGE_SIZE + 1));
  rangeEnd = computed(() => Math.min(this.page() * PAGE_SIZE, this.total()));

  onSearchChange = (search: string) => {
    this.search.set(search);
    this.page.set(1);
    this.loadSellers();
  };

  onPageChange = (page: number) => {
    this.page.set(page);
    this.loadSellers();
  };

  ngOnInit() {
    this.loadSellers();
    this.loadStats();
  }

  loadSellers() {
    this.loading.set(true);
    this.loadError.set(null);
    this.userService
      .getSellers({ search: this.search(), page: this.page(), limit: PAGE_SIZE })
      .subscribe({
        next: (sellers) => {
          this.sellers.set(sellers.items);
          this.total.set(sellers.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.loadError.set(toApiError(err));
          this.loading.set(false);
        },
      });
  }

  loadStats() {
    this.userService.getSellers({ limit: 1 }).subscribe({
      next: (response) => {
        this.totalSellersCount.set(response.total);
      },
      error: (err) => {
        this.loadError.set(toApiError(err));
        console.error('Error loading total sellers count:', err);
      },
    });
    this.productsService.getPendingApprovalProducts({ limit: 1, includeDeleted: false }).subscribe({
      next: (response) => {
        this.pendingApprovalProductsCount.set(response.total);
      },
      error: (err) => {
        this.loadError.set(toApiError(err));
        console.error('Error loading pending approval products:', err);
      },
    });
    this.dealService.getDealsAnalytics().subscribe({
      next: (response) => {
        this.activeDealsCount.set(response.activeDeals);
      },
      error: (err) => {
        this.loadError.set(toApiError(err));
        console.error('Error loading active deals count:', err);
      },
    });
  }
}
