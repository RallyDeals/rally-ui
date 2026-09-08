import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { DealStatus } from '../../../shared/models/deal';
import { DealOverview } from '../interfaces/deal-overview';
import { BuyerFilterDeals, DealSortKey } from '../interfaces/deals-query-params';

const DEFAULT_FILTER: BuyerFilterDeals = '';
const DEFAULT_SORT: DealSortKey = 'relevance';
const DEALS_PER_PAGE = 6;

@Component({
  selector: 'app-browse-deals',
  imports: [ActiveDealCard, DealFilters, Pagination, ErrorState, PageHeader],
  templateUrl: './browse-deals.html',
})
export class BrowseDeals implements OnInit {
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
    // Get initial sellerId and sellerName from route params
    const initialSellerId = this.route.snapshot.queryParams['sellerId'] ?? null;
    const initialSellerName = this.route.snapshot.queryParams['sellerName'] ?? null;
    this.sellerId.set(initialSellerId);
    this.sellerName.set(initialSellerName);

    // Subscribe to query params changes for subsequent navigations
    this.route.queryParams.subscribe((params) => {
      const newSellerId = params['sellerId'] ?? null;
      const newSellerName = params['sellerName'] ?? null;
      // Only reset pagination if sellerId changes
      if (newSellerId !== this.sellerId()) {
        this.sellerId.set(newSellerId);
        this.sellerName.set(newSellerName);
        this.page.set(1);
        this.loadDeals();
      }
    });

    this.loadDeals();
    this.categoriesService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {},
    });
  }

  loadDeals() {
    this.loading.set(true);
    this.loadError.set(null);
    this.dealsService
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
    this.loadDeals();
  };

  onPriceApply = ({ minPrice, maxPrice }: DealPriceRange) => {
    this.minPrice.set(minPrice);
    this.maxPrice.set(maxPrice);
    this.page.set(1);
    this.loadDeals();
  };

  onSortChange = (value: string) => {
    this.sortBy.set(value as DealSortKey);
    this.page.set(1);
    this.loadDeals();
  };

  onFilterChange = (value: string) => {
    this.filterBy.set(value as BuyerFilterDeals);
    this.page.set(1);
    this.loadDeals();
  };

  resetFilters = () => {
    this.selectedCategoryIds.set(new Set());
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.sortBy.set(DEFAULT_SORT);
    this.searchQuery.set('');
    this.sellerId.set(null);
    this.sellerName.set(null);
    this.page.set(1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sellerId: null, sellerName: null },
      queryParamsHandling: 'merge',
    });
    this.loadDeals();
  };

  resetSort = () => {
    this.sortBy.set(DEFAULT_SORT);
    this.page.set(1);
    this.loadDeals();
  };

  clearSellerFilter = () => {
    this.sellerId.set(null);
    this.sellerName.set(null);
    this.page.set(1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sellerId: null, sellerName: null },
      queryParamsHandling: 'merge',
    });
    this.loadDeals();
  };

  categoryName = (categoryId: string): string =>
    this.categories().find((category) => category.id === categoryId)?.name ?? categoryId;

  sortLabel = (key: DealSortKey): string =>
    this.sortOptions.find((option) => option.key === key)?.label ?? key;

  goToPage = (page: number) => {
    this.page.set(page);
    this.loadDeals();
  };
}
