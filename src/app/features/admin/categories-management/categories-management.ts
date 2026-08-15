import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoriesService } from '../../categories/categories.service';
import { Category } from '../../../shared/models/category';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { CategoryRow } from './category-row/category-row';
import { CategoryFormDialog } from './category-form-dialog/category-form-dialog';

@Component({
  selector: 'app-categories-management',
  imports: [PageHeader, CategoryRow, CategoryFormDialog],
  templateUrl: './categories-management.html',
  styleUrl: './categories-management.css',
})
export class CategoriesManagement implements OnInit {
  categoriesService = inject(CategoriesService);
  categories = signal<Category[]>([]);
  loading = signal(true);
  showCreateDialog = signal(false);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.categoriesService.getCategories(true).subscribe((categories) => {
      this.categories.set(categories);
      this.loading.set(false);
    });
  }

  openCreateDialog = () => {
    this.showCreateDialog.set(true);
  };

  closeCreateDialog = () => {
    this.showCreateDialog.set(false);
  };

  onCategoryCreated = (category: Category) => {
    this.categories.update((categories) => [category, ...categories]);
    this.showCreateDialog.set(false);
  };
}
