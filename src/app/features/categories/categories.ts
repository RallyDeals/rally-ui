import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../shared/models/category';
import { CategoriesService } from './categories.service';
import { ApiError } from '../../shared/models/api-error';
import { toApiError } from '../../shared/utils/api-error.util';
import { ErrorState } from '../../shared/components/error-state/error-state';

const CATEGORY_ICONS: Record<string, string> = {
  Electronics: 'devices',
  Watches: 'watch',
  Shoes: 'checkroom',
  'Home & Furniture': 'chair',
  'Beauty & Fragrance': 'spa',
  Menswear: 'checkroom',
};

@Component({
  selector: 'app-categories',
  imports: [RouterLink, ErrorState],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal<ApiError | null>(null);

  constructor(private readonly categoriesService: CategoriesService) {}

  ngOnInit() {
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(toApiError(err));
        this.loading.set(false);
      },
    });
  }

  categoryIcon(name: string): string {
    return CATEGORY_ICONS[name] ?? 'category';
  }
}
