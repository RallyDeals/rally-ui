import { Component, DestroyRef, NgZone, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, Subscription, interval, switchMap, startWith, forkJoin, of, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductsService } from '../../products/products.service';
import { InventoryService } from '../../../shared/services/inventory.service';
import { Product } from '../../../shared/models/product';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { ErrorModal } from '../../../shared/components/error-modal/error-modal';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { FilterPills, FilterPillOption } from '../../../shared/components/filter-pills/filter-pills';
import { SearchInput } from '../../../shared/components/search-input/search-input';
import { IconButton } from '../../../shared/components/icon-button/icon-button';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';
import { ConfirmDialog, ConfirmDialogRequest } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PLACEHOLDER_IMAGE } from '../../../shared/constants/placeholder';
import { ProductRow, StockStatus, toProductRow } from './product-row';
import { resolveImageUrl } from '../../../shared/utils/image-url';
import { Inventory } from '../../../shared/models/inventory';
import { AuthService } from '../../../core/auth/auth.service';

type StatusFilter = 'ALL' | Product['status'] | 'DELETED';

const INVENTORY_POLL_INTERVAL_MS = 30_000;

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
    ImageFallbackDirective,
    ConfirmDialog,
    ErrorModal,
  ],
  templateUrl: './seller-products.html',
  styleUrl: './seller-products.css',
})
export class SellerProducts implements OnInit, OnDestroy {
  private readonly productsService = inject(ProductsService);
  private readonly inventoryService = inject(InventoryService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  private inventoryPollSub: Subscription | null = null;

  readonly placeholderImage = PLACEHOLDER_IMAGE;
  searchQuery = signal('');

  products = signal<ProductRow[]>([]);
  total = signal(0);
  allProductsTotal = signal(0);
  page = signal(1);
  limit = 10;
  loading = signal(true);
  loadError = signal<ApiError | null>(null);
  actionError = signal<ApiError | null>(null);
  statusFilter = signal<StatusFilter>('ALL');
  selectedIds = signal<Set<string>>(new Set());
  hasActiveFilters = computed(() => this.statusFilter() !== 'ALL');

  readonly statusOptions: FilterPillOption[] = [
    { value: 'ALL', label: 'All Products' },
    { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'DELETED', label: 'Deleted' },
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

  emptyState = computed(() => {
    if (this.hasActiveFilters() && this.allProductsTotal() > 0) {
      return {
        title: 'No products found',
        message: 'Try adjusting your filters to see matching orders.',
        icon: 'search_off',
        actionLabel: null,
      };
    }

    return {
      title: 'No orders yet',
      message: 'When you place an order, it will show up here.',
      icon: 'shopping_bag',
      actionLabel: 'Browse Products',
    };
  });

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
    () =>
      this.products().filter((product) => !product.deleted && product.status === 'PENDING_APPROVAL')
        .length,
  );

  readonly lowStockCount = computed(
    () =>
      this.products().filter((product) => !product.deleted && product.stockStatus !== 'IN_STOCK')
        .length,
  );

  get fromIndex(): number {
    return this.total() === 0 ? 0 : (this.page() - 1) * this.limit + 1;
  }

  get toIndex(): number {
    return Math.min(this.page() * this.limit, this.total());
  }

  ngOnInit() {
    this.loadProducts();
    this.destroyRef.onDestroy(() => this.stopInventoryPoll());
  }

  ngOnDestroy() {
    this.stopInventoryPoll();
  }

  loadProducts() {
    const sellerId = this.authService.currentUser()?.id;
    if (!sellerId) {
      this.loadError.set({
        message: 'Seller account not found.',
        path: '/seller/products',
        status: 401,
        timestamp: new Date().toISOString(),
        title: 'Seller account missing',
      });
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.loadError.set(null);
    this.selectedIds.set(new Set());
    this.productsService
      .getSellerProducts(sellerId, {
        status:
          this.statusFilter() === 'ALL' || this.statusFilter() === 'DELETED'
            ? undefined
            : this.statusFilter(),
        deleted: this.statusFilter() === 'DELETED',
        includeDeleted: this.statusFilter() !== 'DELETED' ? false : undefined,
        page: this.page(),
        limit: this.limit,
      })
      .subscribe({
        next: (response) => {
          this.products.set(response.items.map((p) => toProductRow(p)));
          this.total.set(response.total);
          if (!this.hasActiveFilters()) {
            this.allProductsTotal.set(response.total);
          }
          this.loading.set(false);
          this.startInventoryPoll();
        },
        error: (err) => {
          this.loadError.set(toApiError(err));
          this.loading.set(false);
        },
      });
  }

  private startInventoryPoll() {
    this.stopInventoryPoll();
    const productIds = this.products().map((p) => p.id);
    if (productIds.length === 0) return;

    this.ngZone.runOutsideAngular(() => {
      this.inventoryPollSub = interval(INVENTORY_POLL_INTERVAL_MS)
        .pipe(
          startWith(0),
          switchMap(() => this.fetchAllInventory(productIds)),
        )
        .subscribe((inventoryMap) => {
          this.ngZone.run(() => {
            this.products.update((rows) =>
              rows.map((row) => {
                const inv = inventoryMap.get(row.id);
                return inv ? toProductRow(row, inv) : row;
              }),
            );
          });
        });
    });
  }

  private stopInventoryPoll() {
    this.inventoryPollSub?.unsubscribe();
    this.inventoryPollSub = null;
  }

  private fetchAllInventory(productIds: string[]): Observable<Map<string, Inventory>> {
    if (productIds.length === 0) return of(new Map());

    const requests = productIds.map((id) =>
      this.inventoryService.getInventory(id).pipe(
        catchError(() => of(null)),
        map((inv) => ({ id, inv })),
      ),
    );

    return forkJoin(requests).pipe(
      map((results) => {
        const map = new Map<string, Inventory>();
        for (const { id, inv } of results) {
          if (inv) map.set(id, inv);
        }
        return map;
      }),
    );
  }

  closeLoadError = () => {
    this.loadError.set(null);
    this.router.navigate(['/seller']);
  };

  closeActionError = () => {
    this.actionError.set(null);
  };

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

  goToDeals = () => {
    this.router.navigate(['/seller/deals'], { queryParams: { status: 'active' } });
  };

  deleteTarget = signal<Product | null>(null);

  readonly deleteRequest = computed<ConfirmDialogRequest | null>(() => {
    const product = this.deleteTarget();
    if (!product) {
      return null;
    }
    return {
      title: `Delete "${product.name}"?`,
      message: 'The product will be hidden from your store. You can restore it at any time.',
      icon: 'delete',
      confirmLabel: 'Delete',
    };
  });

  deleteProduct = (product: Product) => {
    this.deleteTarget.set(product);
  };

  closeDeleteDialog = () => {
    this.deleteTarget.set(null);
  };

  onDeleteConfirmed = () => {
    const product = this.deleteTarget();
    this.deleteTarget.set(null);
    if (!product) {
      return;
    }
    this.productsService.deleteProduct(product.id).subscribe({
      next: () => {
        const next = new Set(this.selectedIds());
        next.delete(product.id);
        this.selectedIds.set(next);
        this.loadProducts();
      },
      error: (err) => {
        this.actionError.set(toApiError(err));
      },
    });
  };

  restoreTarget = signal<Product | null>(null);

  readonly restoreRequest = computed<ConfirmDialogRequest | null>(() => {
    const product = this.restoreTarget();
    if (!product) {
      return null;
    }
    return {
      title: `Restore "${product.name}"?`,
      message:
        'The product will be resubmitted for approval before it becomes visible in your store again.',
      icon: 'restore',
      iconTone: 'primary',
      confirmTone: 'primary',
      confirmLabel: 'Restore',
    };
  });

  restoreProduct = (product: Product) => {
    this.restoreTarget.set(product);
  };

  closeRestoreDialog = () => {
    this.restoreTarget.set(null);
  };

  onRestoreConfirmed = () => {
    const product = this.restoreTarget();
    this.restoreTarget.set(null);
    if (!product) {
      return;
    }
    this.productsService.restoreProduct(product.id).subscribe({
      next: () => this.loadProducts(),
      error: (err) => {
        this.actionError.set(toApiError(err));
      },
    });
  };
}
