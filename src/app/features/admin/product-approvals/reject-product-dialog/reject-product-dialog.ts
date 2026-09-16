import { Component, HostListener, computed, effect, inject, input, output, signal } from '@angular/core';
import { ProductsService } from '../../../products/products.service';
import { Product } from '../../../../shared/models/product';

@Component({
  selector: 'app-reject-product-dialog',
  imports: [],
  templateUrl: './reject-product-dialog.html',
})
export class RejectProductDialog {
  private readonly productsService = inject(ProductsService);

  open = input(false);
  product = input<Product | null>(null);
  rejected = output<Product>();
  closed = output<void>();

  reason = signal('');
  rejecting = signal(false);
  error = signal<string | null>(null);

  readonly canSubmit = computed(() => this.reason().trim().length > 0 && !this.rejecting());

  constructor() {
    effect(() => {
      if (this.open()) {
        this.reason.set('');
        this.rejecting.set(false);
        this.error.set(null);
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
    if (this.rejecting()) {
      return;
    }
    this.closed.emit();
  };

  submit = () => {
    const product = this.product();
    if (!product || !this.canSubmit()) {
      return;
    }
    this.rejecting.set(true);
    this.error.set(null);
    this.productsService.rejectProduct(product.id, this.reason().trim()).subscribe({
      next: () => {
        this.rejecting.set(false);
        this.rejected.emit(product);
      },
      error: () => {
        this.rejecting.set(false);
        this.error.set('Failed to reject product. Please try again later.');
      },
    });
  };
}
