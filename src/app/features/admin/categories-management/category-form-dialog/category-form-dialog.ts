import { Component, HostListener, computed, effect, inject, input, output, signal } from '@angular/core';
import { CategoriesService } from '../../../categories/categories.service';
import { Category } from '../../../../shared/models/category';
import { IconPicker } from './icon-picker/icon-picker';

const DEFAULT_ICON = 'category';

@Component({
  selector: 'app-category-form-dialog',
  imports: [IconPicker],
  templateUrl: './category-form-dialog.html',
})
export class CategoryFormDialog {
  private readonly categoriesService = inject(CategoriesService);

  open = input(false);
  category = input<Category | null>(null);
  saved = output<Category>();
  closed = output<void>();

  name = signal('');
  description = signal('');
  icon = signal('');
  saving = signal(false);
  error = signal<string | null>(null);

  readonly isEditMode = computed(() => this.category() !== null);
  readonly canSave = computed(() => this.name().trim().length > 0 && !this.saving());

  constructor() {
    effect(() => {
      if (this.open()) {
        this.populate(this.category());
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.dismiss();
    }
  }

  dismiss = () => {
    if (this.saving()) {
      return;
    }
    this.closed.emit();
  };

  private populate(category: Category | null) {
    this.name.set(category?.name ?? '');
    this.description.set(category?.description ?? '');
    this.icon.set(category?.icon ?? '');
    this.error.set(null);
  }

  save = () => {
    if (!this.canSave()) {
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const request = {
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      icon: this.icon() || DEFAULT_ICON,
    };
    const editingCategory = this.category();
    const request$ = editingCategory
      ? this.categoriesService.updateCategory(editingCategory.id, request)
      : this.categoriesService.createCategory(request);
    request$.subscribe({
      next: (category) => {
        this.saving.set(false);
        this.saved.emit(category);
      },
      error: () => {
        this.saving.set(false);
        this.error.set(
          editingCategory ? 'Failed to update category. Please try again later.' : 'Failed to create category. Please try again later.',
        );
      },
    });
  };
}
