import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { SellerStats } from './seller-stats/seller-stats';
import { SellerRow } from './seller-row/seller-row';
import { Seller } from '../interfaces/seller';
import { UserService } from '../../auth/user.service';
import { ProductsService } from '../../products/products.service';
import { DealsCountResponse, DealsService } from '../../deals/deals.service';

const PAGE_SIZE = 3;

@Component({
  selector: 'app-seller-management',
  imports: [PageHeader, SellerStats, SellerRow, Pagination, ErrorState],
  templateUrl: './seller-management.html',
})
export class SellerManagement implements OnInit {
  userService = inject(UserService);
  productsService = inject(ProductsService);
  dealService = inject(DealsService);
  pendingApprovalProductsCount = signal<number>(0);
  activeDealsCount = signal<number>(0);
  totalSellers = signal<number>(0);
  sellers = signal<Seller[]>([]);
  loadError = signal<ApiError | null>(null);
  page = signal<number>(1);

  totalPages = computed(() => Math.max(1, Math.ceil(this.sellers().length / PAGE_SIZE)));

  pagedSellers = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.sellers().slice(start, start + PAGE_SIZE);
  });

  rangeStart = computed(() =>
    this.sellers().length === 0 ? 0 : (this.page() - 1) * PAGE_SIZE + 1,
  );
  rangeEnd = computed(() => Math.min(this.page() * PAGE_SIZE, this.sellers().length));

  onPageChange = (page: number) => {
    this.page.set(page);
  };

  ngOnInit() {
    this.loadSellers();
    this.loadStats();
  }

  loadSellers() {
    this.loadError.set(null);
    this.userService.getSellers().subscribe({
      next: (sellers) => {
        this.sellers.set(sellers.items);
        this.totalSellers.set(sellers.total);
      },
      error: (err) => {
        this.loadError.set(toApiError(err));
      },
    });
  }

  loadStats() {
    this.productsService.getPendingApprovalProducts(1).subscribe({
      next: (response) => {
        this.pendingApprovalProductsCount.set(response.total);
      },
      error: (err) => {
        console.error('Error loading pending approval products:', err);
      }
    });
    this.dealService.getDealsCount().subscribe({
      next: (response) => {
        this.activeDealsCount.set(response.active);
      },
      error: (err) => {
        console.error('Error loading active deals count:', err);
      }
    });
  }
}
