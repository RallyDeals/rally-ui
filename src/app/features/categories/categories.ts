import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../shared/models/category';
import { CategoriesService } from './categories.service';

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
  imports: [RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private readonly categoriesService: CategoriesService) {}

  ngOnInit() {
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load categories. Please try again later.');
        this.loading.set(false);
      },
    });
  }

  categoryIcon(name: string): string {
    return CATEGORY_ICONS[name] ?? 'category';
  }
}
