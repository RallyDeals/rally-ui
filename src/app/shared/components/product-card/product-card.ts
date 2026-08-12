import { Component, OnDestroy, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PLACEHOLDER_IMAGE } from '../../constants/placeholder';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard implements OnDestroy {
  product = input.required<Product>();
  extraClasses = input('');
  added = signal(false);
  private addTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly router: Router,
    private readonly cartService: CartService,
  ) {}

  get imageSrc(): string {
    return this.product().imageUrl ?? PLACEHOLDER_IMAGE;
  }

  openDetails = () => {
    this.router.navigate(['/products', this.product().id]);
  };

  addToCart = (event: Event) => {
    event.stopPropagation();
    this.cartService.add(this.product());
    this.added.set(true);
    clearTimeout(this.addTimer);
    this.addTimer = setTimeout(() => this.added.set(false), 1200);
  };

  ngOnDestroy() {
    clearTimeout(this.addTimer);
  }
}
