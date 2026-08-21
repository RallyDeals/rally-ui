import { Component, OnDestroy, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PLACEHOLDER_IMAGE } from '../../../../shared/constants/placeholder';
import { resolveImageUrl } from '../../../../shared/utils/image-url';
import { Product } from '../../../../shared/models/product';
import { CartService } from '../../../cart/cart.service';
import { ImageFallbackDirective } from '../../../../shared/directives/image-fallback.directive';

@Component({
  selector: 'app-product-card',
  imports: [ImageFallbackDirective],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard implements OnDestroy {
  product = input.required<Product>();
  outOfStock = input(false);
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
  ) {}

  openDetails = () => {
    this.router.navigate(['/products', this.product().id]);
  };

  addToCart = (event: Event) => {
    event.stopPropagation();
    this.cartService.add(this.product());
    this.addedToCart.emit(this.product().id);
    this.added.set(true);
    clearTimeout(this.addTimer);
    this.addTimer = setTimeout(() => this.added.set(false), 1200);
  };

  ngOnDestroy() {
    clearTimeout(this.addTimer);
  }
}
