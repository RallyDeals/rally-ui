import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../products/products.service';
import { TokenService } from '../../../shared/services/token.service';
import { Product } from '../../../shared/models/product';
import { Pagination } from '../../products/browse-products/pagination/pagination';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { FilterPills, FilterPillOption } from '../../../shared/components/filter-pills/filter-pills';
import { SearchInput } from '../../../shared/components/search-input/search-input';
import { IconButton } from '../../../shared/components/icon-button/icon-button';
import { InsightCard } from '../../../shared/components/insight-card/insight-card';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';
import { PLACEHOLDER_IMAGE } from '../../../shared/constants/placeholder';
import { ProductRow, StockStatus, toProductRow } from './product-row';
import { resolveImageUrl } from '../../../shared/utils/image-url';

type StatusFilter = 'ALL' | Product['status'];

@Component({
  selector: 'app-seller-products',
  imports: [
    NgClass,
    DatePipe,
    RouterLink,
    Pagination,
    PageHeader,
    StatCard,
    FilterPills,
    SearchInput,
    IconButton,
    InsightCard,
    ImageFallbackDirective,
  ],
  templateUrl: './seller-products.html',
})
export class SellerProducts implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly tokenService = inject(TokenService);

  readonly placeholderImage = PLACEHOLDER_IMAGE;
  searchQuery = signal('');

  products = signal<ProductRow[]>([]);
  total = signal(0);
  page = signal(1);
  limit = 10;
  loading = signal(true);
  error = signal<string | null>(null);
  statusFilter = signal<StatusFilter>('ALL');
  selectedIds = signal<Set<string>>(new Set());

  readonly statusOptions: FilterPillOption[] = [
    { value: 'ALL', label: 'All Products' },
    { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));

  readonly statusBadgeClasses: Record<Product['status'], string> = {
    PENDING_APPROVAL: 'bg-surface-container text-on-surface-variant',
    APPROVED: 'bg-secondary-container text-on-secondary-container',
    REJECTED: 'bg-error-container text-on-error-container',
  };

  readonly stockStatusConfig: Record<StockStatus, { dot: string; text: string; label: string }> = {
    IN_STOCK: { dot: 'bg-secondary', text: 'text-secondary', label: 'In Stock' },
    LOW_STOCK: { dot: 'bg-primary', text: 'text-primary', label: 'Low Stock' },
    OUT_OF_STOCK: { dot: 'bg-error', text: 'text-error', label: 'Out of Stock' },
  };

  readonly visibleProducts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const items = this.products();
    if (!query) {
      return items;
    }
    return items.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.name.toLowerCase().includes(query),
    );
  });

  readonly resolveImageUrl = resolveImageUrl;

  readonly pendingCount = computed(
    () => this.products().filter((product) => product.status === 'PENDING_APPROVAL').length,
  );

  readonly lowStockCount = computed(
    () => this.products().filter((product) => product.stockStatus !== 'IN_STOCK').length,
  );

  readonly allSelected = computed(() => {
    const items = this.visibleProducts();
    return items.length > 0 && items.every((product) => this.selectedIds().has(product.id));
  });

  get fromIndex(): number {
    return this.total() === 0 ? 0 : (this.page() - 1) * this.limit + 1;
  }

  get toIndex(): number {
    return Math.min(this.page() * this.limit, this.total());
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    const sellerId = this.tokenService.getSellerId();
    if (!sellerId) {
      this.error.set('Seller account not found.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.selectedIds.set(new Set());
    this.productsService
      .getSellerProducts(sellerId, {
        status: this.statusFilter() === 'ALL' ? undefined : this.statusFilter(),
        page: this.page(),
        limit: this.limit,
      })
      .subscribe({
        next: (response) => {
          this.products.set(response.items.map(toProductRow));
          this.total.set(response.total);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load products. Please try again later.');
          this.loading.set(false);
        },
      });
  }

  onStatusChange = (status: string) => {
    this.statusFilter.set(status as StatusFilter);
    this.page.set(1);
    this.loadProducts();
  };

  onSearchInput = (value: string) => {
    this.searchQuery.set(value);
  };

  clearSearch = () => {
    this.searchQuery.set('');
  };

  goToPage = (page: number) => {
    this.page.set(page);
    this.loadProducts();
  };

  toggleSelect = (id: string) => {
    const next = new Set(this.selectedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.selectedIds.set(next);
  };

  toggleSelectAll = () => {
    const items = this.visibleProducts();
    const next = new Set(this.selectedIds());
    if (this.allSelected()) {
      for (const product of items) {
        next.delete(product.id);
      }
    } else {
      for (const product of items) {
        next.add(product.id);
      }
    }
    this.selectedIds.set(next);
  };

  isSelected = (id: string): boolean => this.selectedIds().has(id);

  deleteProduct = (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }
    this.productsService.deleteProduct(product.id).subscribe({
      next: () => {
        const next = new Set(this.selectedIds());
        next.delete(product.id);
        this.selectedIds.set(next);
        this.loadProducts();
      },
      error: () => {
        window.alert('Failed to delete product. Please try again later.');
      },
    });
  };
}
