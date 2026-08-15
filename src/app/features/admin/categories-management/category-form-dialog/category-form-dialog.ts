import { Component, HostListener, computed, inject, input, output, signal } from '@angular/core';
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
  created = output<Category>();
  closed = output<void>();

  name = signal('');
  description = signal('');
  icon = signal('');
  saving = signal(false);
  error = signal<string | null>(null);

  readonly canSave = computed(() => this.name().trim().length > 0 && !this.saving());

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
    this.reset();
    this.closed.emit();
  };

  private reset() {
    this.name.set('');
    this.description.set('');
    this.icon.set('');
    this.error.set(null);
  }

  save = () => {
    if (!this.canSave()) {
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.categoriesService
      .createCategory({
        name: this.name().trim(),
        description: this.description().trim() || undefined,
        icon: this.icon() || DEFAULT_ICON,
      })
      .subscribe({
        next: (category) => {
          this.saving.set(false);
          this.reset();
          this.created.emit(category);
        },
        error: () => {
          this.saving.set(false);
          this.error.set('Failed to create category. Please try again later.');
        },
      });
  };
}
