import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../../shared/models/category';
import { Product } from '../../../shared/models/product';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { ProductFilters, PriceRange } from '../product-filters/product-filters';
import { CategoriesService } from '../../categories/categories.service';
import { ProductsService } from '../products.service';

const DEFAULT_SORT = 'createdAt:desc';

function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

@Component({
  selector: 'app-browse-products',
  imports: [ProductCard, Pagination, ProductFilters],
  templateUrl: './browse-products.html',
  styleUrl: './browse-products.css',
})
export class BrowseProducts implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  total = signal(0);
  page = signal(1);
  limit = 12;
  loading = signal(true);
  error = signal<string | null>(null);
  searchQuery = signal('');
  selectedCategoryId = signal<string | null>(null);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  sortBy = signal(DEFAULT_SORT);

  selectedCategory = computed(
    () => this.categories().find((c) => c.id === this.selectedCategoryId()) ?? null,
  );
  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));

  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  get fromIndex(): number {
    return this.total() === 0 ? 0 : (this.page() - 1) * this.limit + 1;
  }

  get toIndex(): number {
    return Math.min(this.page() * this.limit, this.total());
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.selectedCategoryId.set((params['categoryId'] as string | undefined) ?? null);
      this.minPrice.set(parseOptionalNumber(params['minPrice']));
      this.maxPrice.set(parseOptionalNumber(params['maxPrice']));
      this.loadProducts();
    });
    this.loadCategories();
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set(null);
    this.productsService
      .getProducts({
        q: this.searchQuery().trim() || undefined,
        categoryId: this.selectedCategoryId() ?? undefined,
        minPrice: this.minPrice() ?? undefined,
        maxPrice: this.maxPrice() ?? undefined,
        sort: this.sortBy(),
        page: this.page(),
        limit: this.limit,
      })
      .subscribe({
        next: (response) => {
          this.products.set(response.items);
          this.total.set(response.total);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load products. Please try again later.');
          this.loading.set(false);
        },
      });
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {},
    });
  }

  onSearchInput = (value: string) => {
    this.searchQuery.set(value);
  };

  search = () => {
    this.page.set(1);
    this.loadProducts();
  };

  clearSearch = () => {
    this.searchQuery.set('');
    this.page.set(1);
    this.loadProducts();
  };

  onCategoryChange = (categoryId: string | null) => {
    this.page.set(1);
    this.router.navigate(['/products'], {
      queryParams: this.buildQueryParams({ categoryId: categoryId ?? undefined }),
    });
  };

  onPriceApply = ({ minPrice, maxPrice }: PriceRange) => {
    this.page.set(1);
    this.router.navigate(['/products'], {
      queryParams: this.buildQueryParams({
        minPrice: minPrice ?? undefined,
        maxPrice: maxPrice ?? undefined,
      }),
    });
  };

  onSortChange = (sort: string) => {
    this.sortBy.set(sort);
    this.page.set(1);
    this.loadProducts();
  };

  resetFilters = () => {
    this.searchQuery.set('');
    this.sortBy.set(DEFAULT_SORT);
    this.page.set(1);
    this.router.navigate(['/products'], { queryParams: {} });
  };

  goToPage = (page: number) => {
    this.page.set(page);
    this.loadProducts();
  };

  private buildQueryParams(
    override: Record<string, string | number | null | undefined>,
  ): Record<string, string> {
    const params: Record<string, string> = {};
    const categoryId = this.selectedCategoryId();
    const minPrice = this.minPrice();
    const maxPrice = this.maxPrice();
    if (categoryId) {
      params['categoryId'] = categoryId;
    }
    if (minPrice !== null) {
      params['minPrice'] = String(minPrice);
    }
    if (maxPrice !== null) {
      params['maxPrice'] = String(maxPrice);
    }
    for (const [key, value] of Object.entries(override)) {
      if (value === null || value === undefined) {
        delete params[key];
      } else {
        params[key] = String(value);
      }
    }
    return params;
  }
}
