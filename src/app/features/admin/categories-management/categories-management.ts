import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoriesService } from '../../categories/categories.service';
import { Category } from '../../../shared/models/category';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { ErrorModal } from '../../../shared/components/error-modal/error-modal';
import { CategoryRow } from './category-row/category-row';
import { CategoryFormDialog } from './category-form-dialog/category-form-dialog';

@Component({
  selector: 'app-categories-management',
  imports: [PageHeader, CategoryRow, CategoryFormDialog, ErrorState, ErrorModal],
  templateUrl: './categories-management.html',
})
export class CategoriesManagement implements OnInit {
  categoriesService = inject(CategoriesService);
  categories = signal<Category[]>([]);
  loading = signal(true);
  loadError = signal<ApiError | null>(null);
  actionError = signal<ApiError | null>(null);
  showDialog = signal(false);
  editingCategory = signal<Category | null>(null);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.loadError.set(null);
    this.categoriesService.getCategories(true).subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(toApiError(err));
        this.loading.set(false);
      },
    });
  }

  openCreateDialog = () => {
    this.editingCategory.set(null);
    this.showDialog.set(true);
  };

  openUpdateDialog = (category: Category) => {
    this.editingCategory.set(category);
    this.showDialog.set(true);
  };

  closeDialog = () => {
    this.showDialog.set(false);
  };

  onCategorySaved = (category: Category) => {
    this.categories.update((categories) =>
      this.editingCategory()
        ? categories.map((existing) => (existing.id === category.id ? category : existing))
        : [category, ...categories],
    );
    this.showDialog.set(false);
  };
  onCategoryDelete = (id: string) => {
    this.actionError.set(null);
    this.categoriesService.deleteCategory(id).subscribe({
      next: () => {
        this.categories.update((categories) => categories.filter((c) => c.id !== id));
      },
      error: (err) => {
        this.actionError.set(toApiError(err));
      },
    });
  };

  closeActionError = () => {
    this.actionError.set(null);
  };
}
