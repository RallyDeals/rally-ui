import { Component, OnDestroy, effect, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PLACEHOLDER_IMAGE } from '../../../../shared/constants/placeholder';
import { resolveImageUrl } from '../../../../shared/utils/image-url';
import { Product } from '../../../../shared/models/product';
import { CartService } from '../../../cart/cart.service';
import { DealsService } from '../../../deals/deals.service';
import { DealStatus } from '../../../../shared/models/deal';
import { DealOverview } from '../../../deals/interfaces/DealOverview';

@Component({
  selector: 'app-product-card',
  imports: [],
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
  private dealSub: Subscription | null = null;

  deal = signal<DealOverview | null>(null);

  constructor(
    private readonly router: Router,
    private readonly cartService: CartService,
    private readonly dealsService: DealsService,
  ) {
    effect(() => {
      const productId = this.product().id;
      this.dealSub?.unsubscribe();
      this.dealSub = this.dealsService
        .getDealsOverview({ productId, status: DealStatus.ACTIVE, limit: 1 })
        .subscribe((response) => this.deal.set(response.items[0] ?? null));
    });
  }

  get imageSrc(): string {
    return resolveImageUrl(this.product().imageUrl, PLACEHOLDER_IMAGE);
  }

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
    this.dealSub?.unsubscribe();
  }
}
