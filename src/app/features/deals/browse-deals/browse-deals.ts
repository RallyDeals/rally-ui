import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Category } from '../../../shared/models/category';
import { ActiveDealCard } from '../components/deal-card/deal-card';
import { DealFilters, DealPriceRange } from '../components/deal-filters/deal-filters';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { CategoriesService } from '../../categories/categories.service';
import { DealsService } from '../deals.service';
import { DealOverview } from '../interfaces/deal-overview';
import { BuyerFilterDeals, DealSortKey } from '../interfaces/deals-query-params';

const DEFAULT_FILTER: BuyerFilterDeals = '';
const DEFAULT_SORT: DealSortKey = 'relevance';
const DEALS_PER_PAGE = 6;

function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

@Component({
  selector: 'app-browse-deals',
  imports: [ActiveDealCard, DealFilters, Pagination, ErrorState, PageHeader],
  templateUrl: './browse-deals.html',
})
export class BrowseDeals implements OnInit, OnDestroy {
  private dealsRequest: Subscription | null = null;
  deals = signal<DealOverview[]>([]);
  categories = signal<Category[]>([]);
  total = signal(0);
  loading = signal(true);
  loadError = signal<ApiError | null>(null);

  searchQuery = signal('');
  selectedCategoryIds = signal<Set<string>>(new Set());
  selectedCategoryIdsArray = computed(() => [...this.selectedCategoryIds()]);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  sortBy = signal<DealSortKey>(DEFAULT_SORT);
  filterBy = signal<BuyerFilterDeals>(DEFAULT_FILTER);
  sellerId = signal<string | null>(null);
  sellerName = signal<string | null>(null);
  page = signal(1);
  readonly limit = DEALS_PER_PAGE;

  sortOptions: { key: DealSortKey; label: string }[] = [
    { key: 'relevance', label: 'Relevance' },
    { key: 'ending-soon', label: 'Ending Soon' },
    { key: 'most-joined', label: 'Most Joined' },
    { key: 'newest', label: 'Newest' },
    { key: 'price-asc', label: 'Price: Low to High' },
    { key: 'price-desc', label: 'Price: High to Low' },
    { key: 'discount', label: 'Discount %' },
  ];

  statusOptions: { key: BuyerFilterDeals; label: string }[] = [
    { key: '', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' },
  ];

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));

  fromIndex = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.limit + 1));

  toIndex = computed(() => Math.min(this.page() * this.limit, this.total()));

  activeFilterCount = computed(() => {
    let count = this.selectedCategoryIds().size;
    if (this.minPrice() !== null || this.maxPrice() !== null) {
      count += 1;
    }
    if (this.sortBy() !== DEFAULT_SORT) {
      count += 1;
    }
    if (this.sellerId() !== null) {
      count += 1;
    }
    return count;
  });

  priceLabel = computed(() => {
    const min = this.minPrice();
    const max = this.maxPrice();
    if (min !== null && max !== null) {
      return `${min} – ${max}`;
    }
    if (min !== null) {
      return `From ${min}`;
    }
    if (max !== null) {
      return `Up to ${max}`;
    }
    return '';
  });

  constructor(
    private readonly dealsService: DealsService,
    private readonly categoriesService: CategoriesService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.applyQueryParams(params);
      this.loadDeals();
    });

    this.categoriesService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {},
    });
  }

  private applyQueryParams(params: Params) {
    const rawCategories = params['categories'];
    const categories = (
      Array.isArray(rawCategories) ? rawCategories : [rawCategories]
    )
      .filter((c): c is string => typeof c === 'string' && c.length > 0)
      .flatMap((c) => c.split(','));
    this.selectedCategoryIds.set(new Set(categories.map((c) => c.trim()).filter(Boolean)));
    this.minPrice.set(parseOptionalNumber(params['minPrice']));
    this.maxPrice.set(parseOptionalNumber(params['maxPrice']));
    const sort = params['sort'] as DealSortKey | undefined;
    this.sortBy.set(sort && this.sortOptions.some((o) => o.key === sort) ? sort : DEFAULT_SORT);
    const status = params['status'] as BuyerFilterDeals | undefined;
    this.filterBy.set(status === 'active' || status === 'pending' ? status : DEFAULT_FILTER);
    const search = params['search'];
    this.searchQuery.set(typeof search === 'string' ? search : '');
    const sellerId = params['sellerId'];
    this.sellerId.set(typeof sellerId === 'string' ? sellerId : null);
    const sellerName = params['sellerName'];
    this.sellerName.set(typeof sellerName === 'string' ? sellerName : null);
    this.page.set(parseOptionalNumber(params['page']) ?? 1);
  }

  ngOnDestroy() {
    this.dealsRequest?.unsubscribe();
  }

  loadDeals() {
    this.loading.set(true);
    this.loadError.set(null);
    this.dealsRequest?.unsubscribe();
    this.dealsRequest = this.dealsService
      .getDealsOverview({
        status: this.filterBy(),
        search: this.searchQuery().trim() || undefined,
        categories: Array.from(this.selectedCategoryIds()),
        minPrice: this.minPrice() ?? undefined,
        maxPrice: this.maxPrice() ?? undefined,
        sort: this.sortBy(),
        sellerId: this.sellerId() ?? undefined,
        page: this.page(),
        limit: this.limit,
      })
      .subscribe({
        next: (response) => {
          this.deals.set(response.items);
          this.total.set(response.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.loadError.set(toApiError(err));
        },
      });
  }

  onCategoryToggle = (categoryId: string) => {
    this.selectedCategoryIds.update((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
    this.page.set(1);
    this.navigateWithState();
  };

  onPriceApply = ({ minPrice, maxPrice }: DealPriceRange) => {
    this.minPrice.set(minPrice);
    this.maxPrice.set(maxPrice);
    this.page.set(1);
    this.navigateWithState();
  };

  onSortChange = (value: string) => {
    this.sortBy.set(value as DealSortKey);
    this.page.set(1);
    this.navigateWithState();
  };

  onFilterChange = (value: string) => {
    this.filterBy.set(value as BuyerFilterDeals);
    this.page.set(1);
    this.navigateWithState();
  };

  resetFilters = () => {
    this.selectedCategoryIds.set(new Set());
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.sortBy.set(DEFAULT_SORT);
    this.searchQuery.set('');
    this.sellerId.set(null);
    this.sellerName.set(null);
    this.filterBy.set(DEFAULT_FILTER);
    this.page.set(1);
    this.navigateWithState();
  };

  resetSort = () => {
    this.sortBy.set(DEFAULT_SORT);
    this.page.set(1);
    this.navigateWithState();
  };

  clearSellerFilter = () => {
    this.sellerId.set(null);
    this.sellerName.set(null);
    this.page.set(1);
    this.navigateWithState();
  };

  categoryName = (categoryId: string): string =>
    this.categories().find((category) => category.id === categoryId)?.name ?? categoryId;

  sortLabel = (key: DealSortKey): string =>
    this.sortOptions.find((option) => option.key === key)?.label ?? key;

  goToPage = (page: number) => {
    this.page.set(page);
    this.navigateWithState();
  };

  private navigateWithState() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.buildQueryParams(),
    });
  }

  private buildQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};
    const search = this.searchQuery().trim();
    if (search) {
      params['search'] = search;
    }
    const categories = this.selectedCategoryIdsArray();
    if (categories.length) {
      params['categories'] = categories.join(',');
    }
    if (this.minPrice() !== null) {
      params['minPrice'] = String(this.minPrice());
    }
    if (this.maxPrice() !== null) {
      params['maxPrice'] = String(this.maxPrice());
    }
    if (this.sortBy() !== DEFAULT_SORT) {
      params['sort'] = this.sortBy();
    }
    if (this.filterBy() !== DEFAULT_FILTER) {
      params['status'] = this.filterBy();
    }
    if (this.sellerId()) {
      params['sellerId'] = this.sellerId()!;
    }
    if (this.sellerName()) {
      params['sellerName'] = this.sellerName()!;
    }
    if (this.page() > 1) {
      params['page'] = String(this.page());
    }
    return params;
  }
}
