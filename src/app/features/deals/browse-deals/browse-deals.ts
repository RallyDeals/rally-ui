import { Component, OnInit, computed, signal } from '@angular/core';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Category } from '../../../shared/models/category';
import { ActiveDealCard } from '../components/deal-card/deal-card';
import {
  DealFilters,
  DealPriceRange,
  DealStatusKey,
} from '../components/deal-filters/deal-filters';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { CategoriesService } from '../../categories/categories.service';
import { DealsService } from '../deals.service';
import { DealView, DealStatus } from '../../../shared/models/deal';

export type DealSortKey = DealStatusKey | 'relevance' | 'price-asc' | 'price-desc' | 'discount';

const DEFAULT_SORT: DealSortKey = 'relevance';
const DEALS_PER_PAGE = 6;

@Component({
  selector: 'app-browse-deals',
  imports: [ActiveDealCard, DealFilters, Pagination, ErrorState, PageHeader],
  templateUrl: './browse-deals.html',
})
export class BrowseDeals implements OnInit {
  deals = signal<DealView[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  loadError = signal<ApiError | null>(null);

  selectedCategoryIds = signal<Set<string>>(new Set());
  selectedCategoryIdsArray = computed(() => [...this.selectedCategoryIds()]);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  sortBy = signal<DealSortKey>(DEFAULT_SORT);
  page = signal(1);

  sortOptions: { key: DealSortKey; label: string }[] = [
    { key: 'relevance', label: 'Relevance' },
    { key: 'ending-soon', label: 'Ending Soon' },
    { key: 'most-joined', label: 'Most Joined' },
    { key: 'newest', label: 'Newest' },
    { key: 'price-asc', label: 'Price: Low to High' },
    { key: 'price-desc', label: 'Price: High to Low' },
    { key: 'discount', label: 'Discount %' },
  ];

  filteredDeals = computed(() => {
    const categories = this.selectedCategoryIds();
    const min = this.minPrice();
    const max = this.maxPrice();
    const list = this.deals().filter((deal) => {
      if (categories.size > 0) {
        const categoryId = deal.category?.id;
        if (!categoryId || !categories.has(categoryId)) {
          return false;
        }
      }
      if (min !== null && deal.dealPrice < min) {
        return false;
      }
      if (max !== null && deal.dealPrice > max) {
        return false;
      }
      return true;
    });
    return this.sortDeals(list);
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredDeals().length / DEALS_PER_PAGE)),
  );

  pagedDeals = computed(() => {
    const start = (this.page() - 1) * DEALS_PER_PAGE;
    return this.filteredDeals().slice(start, start + DEALS_PER_PAGE);
  });

  fromIndex = computed(() =>
    this.filteredDeals().length === 0 ? 0 : (this.page() - 1) * DEALS_PER_PAGE + 1,
  );

  toIndex = computed(() =>
    Math.min(this.page() * DEALS_PER_PAGE, this.filteredDeals().length),
  );

  activeFilterCount = computed(() => {
    let count = this.selectedCategoryIds().size;
    if (this.minPrice() !== null || this.maxPrice() !== null) {
      count += 1;
    }
    if (this.sortBy() !== DEFAULT_SORT) {
      count += 1;
    }
    return count;
  });

  isStatusSort = computed<DealStatusKey | null>(() => {
    const current = this.sortBy();
    if (current === 'ending-soon' || current === 'most-joined' || current === 'newest') {
      return current;
    }
    return null;
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
  ) {}

  ngOnInit(): void {
    this.loadDeals();
    this.categoriesService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {},
    });
  }

  loadDeals() {
    this.loading.set(true);
    this.loadError.set(null);
    this.dealsService.getActiveDeals().subscribe({
      next: (deals) => {
        this.deals.set(deals);
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
  };

  onPriceApply = ({ minPrice, maxPrice }: DealPriceRange) => {
    this.minPrice.set(minPrice);
    this.maxPrice.set(maxPrice);
    this.page.set(1);
  };

  onStatusChange = (status: DealStatusKey) => {
    this.sortBy.set(status);
    this.page.set(1);
  };

  onSortChange = (value: string) => {
    this.sortBy.set(value as DealSortKey);
    this.page.set(1);
  };

  resetFilters = () => {
    this.selectedCategoryIds.set(new Set());
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.sortBy.set(DEFAULT_SORT);
    this.page.set(1);
  };

  resetSort = () => {
    this.sortBy.set(DEFAULT_SORT);
    this.page.set(1);
  };

  categoryName = (categoryId: string): string =>
    this.categories().find((category) => category.id === categoryId)?.name ?? categoryId;

  sortLabel = (key: DealSortKey): string =>
    this.sortOptions.find((option) => option.key === key)?.label ?? key;

  goToPage = (page: number) => {
    this.page.set(page);
  };

  private sortDeals(list: DealView[]): DealView[] {
    const copy = [...list];
    switch (this.sortBy()) {
      case 'price-asc':
        return copy.sort((a, b) => a.dealPrice - b.dealPrice);
      case 'price-desc':
        return copy.sort((a, b) => b.dealPrice - a.dealPrice);
      case 'discount':
        return copy.sort((a, b) => savingsOf(b) - savingsOf(a));
      case 'ending-soon':
        return copy.sort(
          (a, b) =>
            (a.endTime ? new Date(a.endTime).getTime() : Number.POSITIVE_INFINITY) -
            (b.endTime ? new Date(b.endTime).getTime() : Number.POSITIVE_INFINITY),
        );
      case 'most-joined':
        return copy.sort((a, b) => b.currentParticipants - a.currentParticipants);
      case 'newest':
        return copy.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      default:
        return copy;
    }
  }
}

function savingsOf(deal: DealView): number {
  if (!deal.originalPrice || deal.originalPrice <= 0) {
    return 0;
  }
  return Math.round((1 - deal.dealPrice / deal.originalPrice) * 100);
}