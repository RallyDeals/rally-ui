import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { ErrorModal } from '../../../shared/components/error-modal/error-modal';
import { ProductApprovalFilters } from './product-approval-filters/product-approval-filters';
import { PendingProductRow } from './pending-product-row/pending-product-row';
import { ProductsService } from '../../products/products.service';
import { Product } from '../../../shared/models/product';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { UserService } from '../../auth/user.service';
import { CategoriesService } from '../../categories/categories.service';
import { Category } from '../../../shared/models/category';
import { Seller } from '../interfaces/seller';

const PAGE_SIZE = 4;

@Component({
  selector: 'app-product-approvals',
  imports: [PageHeader, Pagination, ErrorState, ErrorModal, ProductApprovalFilters, PendingProductRow],
  templateUrl: './product-approvals.html',
})
export class ProductApprovals implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly userService = inject(UserService);
  private readonly categoriesService = inject(CategoriesService);

  pendingProducts = signal<Product[]>([]);
  total = signal(0);
  sellers = signal<Seller[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  loadError = signal<ApiError | null>(null);
  actionError = signal<ApiError | null>(null);

  selectedCategoryId = signal('');
  selectedSellerId = signal('');

  page = signal(1);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));

  get fromIndex(): number {
    return this.total() === 0 ? 0 : (this.page() - 1) * PAGE_SIZE + 1;
  }

  get toIndex(): number {
    return Math.min(this.page() * PAGE_SIZE, this.total());
  }

  ngOnInit() {
    this.loadPendingProducts();
    this.loadCategories();
    this.loadSellers();
  }

  loadPendingProducts() {
    this.loading.set(true);
    this.loadError.set(null);
    this.productsService
      .getPendingApprovalProducts({
        categoryId: this.selectedCategoryId() || undefined,
        sellerId: this.selectedSellerId() || undefined,
        page: this.page(),
        limit: PAGE_SIZE,
      })
      .subscribe({
        next: (response) => {
          this.pendingProducts.set(response.items);
          this.total.set(response.total);
          this.loading.set(false);
          const lastPage = Math.max(1, Math.ceil(response.total / PAGE_SIZE));
          if (this.page() > lastPage) {
            this.page.set(lastPage);
            this.loadPendingProducts();
          }
        },
        error: (err) => {
          this.loadError.set(toApiError(err));
          this.loading.set(false);
        },
      });
  }

  onCategoryFilterChange = (categoryId: string) => {
    this.selectedCategoryId.set(categoryId);
    this.page.set(1);
    this.loadPendingProducts();
  };

  onSellerFilterChange = (sellerId: string) => {
    this.selectedSellerId.set(sellerId);
    this.page.set(1);
    this.loadPendingProducts();
  };

  loadSellers(){
    this.userService.getSellers({ limit: 100 }).subscribe({
      next: (sellers) => {
        this.sellers.set(sellers.items);
      },
      error: (err) => {
        this.loadError.set(toApiError(err));
      }
    });
  }

  loadCategories(){
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (err) => {
        this.loadError.set(toApiError(err));
      }
    })
  }

  closeActionError = () => {
    this.actionError.set(null);
  };

  goToPage = (page: number) => {
    this.page.set(page);
    this.loadPendingProducts();
  };

  approveProduct = (product: Product) => {
    this.actionError.set(null);
    this.productsService.approveProduct(product.id).subscribe({
      next: () => {
        this.loadPendingProducts();
      },
      error: (err) => {
        this.actionError.set(toApiError(err));
      },
    });
  };

  rejectProduct = (product: Product) => {
    this.actionError.set(null);
    this.productsService.rejectProduct(product.id).subscribe({
      next: () => {
        this.loadPendingProducts();
      },
      error: (err) => {
        this.actionError.set(toApiError(err));
      },
    });
  };
}
