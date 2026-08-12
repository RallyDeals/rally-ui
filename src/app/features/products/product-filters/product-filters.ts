import { Component, effect, input, output } from '@angular/core';
import { Category } from '../../../shared/models/category';

export interface PriceRange {
  minPrice: number | null;
  maxPrice: number | null;
}

@Component({
  selector: 'app-product-filters',
  imports: [],
  templateUrl: './product-filters.html',
  styleUrl: './product-filters.css',
})
export class ProductFilters {
  categories = input.required<Category[]>();
  selectedCategoryId = input<string | null>(null);
  minPrice = input<number | null>(null);
  maxPrice = input<number | null>(null);

  categoryChange = output<string | null>();
  priceApply = output<PriceRange>();
  reset = output<void>();

  priceMin = '';
  priceMax = '';

  constructor() {
    effect(() => {
      this.priceMin = this.minPrice() === null ? '' : String(this.minPrice());
      this.priceMax = this.maxPrice() === null ? '' : String(this.maxPrice());
    });
  }

  onCategoryToggle = (categoryId: string, event: Event) => {
    const checked = (event.target as HTMLInputElement).checked;
    this.categoryChange.emit(checked ? categoryId : null);
  };

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
