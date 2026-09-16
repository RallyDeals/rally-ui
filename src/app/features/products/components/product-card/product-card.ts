import { Component, OnDestroy, input, output, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { PLACEHOLDER_IMAGE } from '../../../../shared/constants/placeholder';
import { resolveImageUrl } from '../../../../shared/utils/image-url';
import { Product } from '../../../../shared/models/product';
import { CartService } from '../../../cart/cart.service';
import { ImageFallbackDirective } from '../../../../shared/directives/image-fallback.directive';
import { AuthService } from '../../../../core/auth/auth.service';
import { SnakeCasePipe } from '../../../../shared/pipes/snake-case.pipe';

@Component({
  selector: 'app-product-card',
  imports: [ImageFallbackDirective, SnakeCasePipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard implements OnDestroy {
  product = input.required<Product>();
  outOfStock = computed(() => this.product().stockDescription === 'out_of_stock');
  lowStock = computed(() => this.product().stockDescription === 'low_stock');
  stockDescription = computed(() => this.product().stockDescription ?? '');
  cartQuantity = computed(
    () => this.cartService.items().find((i) => i.id === this.product().id)?.quantity ?? 0,
  );
  allInCart = computed(() => {
    const stock = this.product().availableStock;
    return stock != null && stock > 0 && this.cartQuantity() >= stock;
  });
  extraClasses = input('');
  added = signal(false);
  addedToCart = output<string>();
  private addTimer: ReturnType<typeof setTimeout> | undefined;

  get hasActiveDeal(): boolean {
    console.log('Checking for active deals:', this.product().deals);
    return (this.product().deals?.length ?? 0) > 0;
  }

  get imageSrc(): string {
    return resolveImageUrl(this.product().imageUrl, PLACEHOLDER_IMAGE);
  }

  constructor(
    private readonly router: Router,
    private readonly cartService: CartService,
    private readonly authService: AuthService,
  ) {}

  openDetails = () => {
    this.router.navigate(['/products', this.product().id]);
  };

  addToCart = (event: Event) => {
    event.stopPropagation();
    if (this.allInCart()) {
      return;
    }
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: `/products/${this.product().id}` },
      });
      return;
    }
    this.cartService.add(this.product(), 1, this.product().availableStock);
    this.addedToCart.emit(this.product().id);
    this.added.set(true);
    clearTimeout(this.addTimer);
    this.addTimer = setTimeout(() => this.added.set(false), 1200);
  };

  ngOnDestroy() {
    clearTimeout(this.addTimer);
  }
}
