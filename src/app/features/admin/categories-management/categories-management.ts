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
  showDialog = signal(false);
  editingCategory = signal<Category | null>(null);

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
    this.categories.update((categories) => categories.filter(c => c.id !== id));
  }
}
