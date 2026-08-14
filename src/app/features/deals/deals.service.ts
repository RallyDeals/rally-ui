import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { ProductsService } from '../products/products.service';
import { Product } from '../../shared/models/product';
import { DealView } from '../../shared/models/deal';
import { getDealById, joinDeal, listActiveDeals } from '../../shared/mocks/deals';
import { resolveImageUrl } from '../../shared/utils/image-url';
import { PLACEHOLDER_IMAGE } from '../../shared/constants/placeholder';

export type { DealView, DealStatus } from '../../shared/models/deal';

@Injectable({ providedIn: 'root' })
export class DealsService {
  constructor(private readonly productsService: ProductsService) {}

  getActiveDeals(): Observable<DealView[]> {
    return forkJoin(listActiveDeals().map((deal) => this.mergeProduct(deal)));
  }

  getActiveDeal(id: string): Observable<DealView | null> {
    const deal = getDealById(id);
    if (!deal) {
      return of(null);
    }
    return this.mergeProduct(deal);
  }

  /** Mocks a buyer joining a deal so its participant count updates everywhere. */
  joinDeal(id: string): Observable<DealView | null> {
    const deal = joinDeal(id);
    if (!deal) {
      return of(null);
    }
    return this.mergeProduct(deal);
  }

  private mergeProduct(deal: DealView): Observable<DealView> {
    return this.productsService.getProduct(deal.productId).pipe(
      map((product) => mergeRealProduct(deal, product)),
      // Fall back to the mocked deal data when the catalog product can't be loaded.
      catchError(() => of(deal)),
    );
  }
}

function mergeRealProduct(deal: DealView, product: Product): DealView {
  const image = resolveImageUrl(
    product.imageUrl ?? product.images?.[0] ?? deal.image,
    PLACEHOLDER_IMAGE,
  );
  return {
    ...deal,
    product,
    image,
    imageAlt: product.name,
    title: product.name,
    description: product.description,
    originalPrice: product.basePrice,
    category: product.category,
    images: product.images ?? [],
  };
}
