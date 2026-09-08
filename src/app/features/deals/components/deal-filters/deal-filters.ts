import { Component, effect, input, output } from '@angular/core';
import { Category } from '../../../../shared/models/category';

export interface DealPriceRange {
  minPrice: number | null;
  maxPrice: number | null;
}

@Component({
  selector: 'app-deal-filters',
  imports: [],
  templateUrl: './deal-filters.html',
})
export class DealFilters {
  categories = input<Category[]>([]);
  selectedCategoryIds = input<string[]>([]);
  minPrice = input<number | null>(null);
  maxPrice = input<number | null>(null);

  categoryToggle = output<string>();
  priceApply = output<DealPriceRange>();
  reset = output<void>();

  priceMin = '';
  priceMax = '';

  constructor() {
    effect(() => {
      this.priceMin = this.minPrice() === null ? '' : String(this.minPrice());
      this.priceMax = this.maxPrice() === null ? '' : String(this.maxPrice());
    });
  }

  onPriceInput = (field: 'min' | 'max', event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    if (field === 'min') {
      this.priceMin = value;
    } else {
      this.priceMax = value;
    }
  };

  onPriceApply = () => {
    this.priceApply.emit({
      minPrice: this.parsePrice(this.priceMin),
      maxPrice: this.parsePrice(this.priceMax),
    });
  };

  private parsePrice(value: string): number | null {
    if (value.trim() === '') {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
}
