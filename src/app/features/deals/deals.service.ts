import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { ProductsService } from '../products/products.service';
import { Product } from '../../shared/models/product';
import { Category } from '../../shared/models/category';
import { Deal } from '../../pages/home/featured-deals-section/deal';
import { MOCK_ACTIVE_DEALS } from './mock-deals';
import { resolveImageUrl } from '../../shared/utils/image-url';
import { PLACEHOLDER_IMAGE } from '../../shared/constants/placeholder';

export interface DealView extends Deal {
  productId: string;
  endsAt: string;
  createdAt: string;
  category?: Category | null;
}

@Injectable({ providedIn: 'root' })
export class DealsService {
  constructor(private readonly productsService: ProductsService) {}

  getActiveDeals(): Observable<DealView[]> {
    return forkJoin(MOCK_ACTIVE_DEALS.map((deal) => this.mergeProduct(deal)));
  }

  getActiveDeal(id: string | number): Observable<DealView | null> {
    const deal = MOCK_ACTIVE_DEALS.find((item) => String(item.id) === String(id));
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
    image,
    imageAlt: product.name,
    title: product.name,
    description: product.description,
    originalPrice: product.basePrice,
    category: product.category,
  };
}
